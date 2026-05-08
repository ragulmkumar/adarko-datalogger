import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import OctIcon from 'react-native-vector-icons/Octicons';
import * as Progress from 'react-native-progress';
import { showToast } from '../utils/ShowToast';
import { useNavigation } from '@react-navigation/native';

const CHUNK_LENGTH = 240;
const SECTOR_SIZE = 8 * 1024;
const BASE_ADDRESS = 0x080000;

const OTATab = ({ characteristics }) => {
  const navigation = useNavigation();
  const [fileContent, setFileContent] = useState([]);
  const [fileLength, setFileLength] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const [fileName, setFileName] = useState('');
  const [nbSector, setNbSector] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [otaSupported, setOtaSupported] = useState(true);

  let fileContRef = useRef(null);
  let fileLennRef = useRef(0);

  const {
    writeAddressCharacteristic,
    writeWithoutResponseCharacteristic,
    indicateCharacteristic,
    mtu,
    isConnected,
  } = characteristics || {};

  // Check if OTA is supported
  useEffect(() => {
    if (characteristics && isConnected) {
      const hasOtaSupport = !!(
        writeAddressCharacteristic && writeWithoutResponseCharacteristic
      );
      setOtaSupported(hasOtaSupport);

      if (!hasOtaSupport) {
        console.log('[OTA] Characteristics not available on this device');
      } else {
        console.log('[OTA] All characteristics available');
      }
    }
  }, [
    characteristics,
    isConnected,
    writeAddressCharacteristic,
    writeWithoutResponseCharacteristic,
  ]);

  // Monitor indication characteristic for device ready signal (EXACT MATCH to working version)
  useEffect(() => {
    if (!indicateCharacteristic || !otaSupported || !isConnected) {
      return;
    }

    let monitorSubscription = null;

    const monitorConfirmation = async () => {
      try {
        monitorSubscription = indicateCharacteristic.monitor(
          (error, characteristic) => {
            if (characteristic?.value) {
              const confirmationValue = Buffer.from(
                characteristic.value,
                'base64',
              );
              const indication = confirmationValue.readUInt8(0);
              if (indication === 0x02) {
                console.log('[OTA] Device ready to receive file.');
                setIsUploading(true);
                sliceAndSend();
              } else if (indication === 0x01) {
                console.log('[OTA] Rebooting...');
                showToast('info', 'Rebooting', 'Device is rebooting');
              } else if (indication === 0x03) {
                console.error('[OTA] Error: Device not free to upload.');
                showToast('error', 'Error', 'Device not ready for upload');
                setIsUploading(false);
              }
            }
          },
        );
      } catch (error) {
        console.error('[OTA] Error starting monitor:', error.message);
      }
    };

    monitorConfirmation();

    return () => {
      if (monitorSubscription && monitorSubscription.remove) {
        monitorSubscription.remove();
      }
    };
  }, [indicateCharacteristic, otaSupported, isConnected]);

  const calculateNbSector = length => {
    let sectors = Math.ceil(length / SECTOR_SIZE);
    setNbSector(sectors);
  };

  const writeBaseAddress = async () => {
    if (!writeAddressCharacteristic) {
      console.error('[OTA] Write address characteristic is not available.');
      showToast('error', 'Error', 'OTA not supported on this device');
      return;
    }

    try {
      const baseAddressData = Buffer.alloc(5);
      baseAddressData[0] = 0x02;
      baseAddressData[1] = 0x08;
      baseAddressData[2] = 0x00;
      baseAddressData[3] = 0x00;
      baseAddressData[4] = 0x20;

      console.log('[OTA] Base address data:', baseAddressData);

      const base64Data = baseAddressData.toString('base64');

      console.log('[OTA] Writing base address data:', base64Data);

      await writeAddressCharacteristic.writeWithoutResponse(base64Data);
      console.log('[OTA] Write successful');
    } catch (error) {
      console.error('[OTA] Error writing to base address:', error.message);
      showToast('error', 'Error', 'Failed to write base address');
    }
  };

  const writeRawData = async chunkk => {
    if (!writeWithoutResponseCharacteristic) {
      console.error(
        '[OTA] Write without response characteristic is not available.',
      );
      return;
    }

    try {
      const chunk = new Uint8Array(chunkk);
      if (chunk.length > CHUNK_LENGTH) {
        throw new Error('Chunk size exceeds the maximum allowed size.');
      }
      const base64Data = Buffer.from(chunk).toString('base64');

      await writeWithoutResponseCharacteristic.writeWithoutResponse(base64Data);
      console.log('[OTA] Raw data written:', chunk.length, 'bytes');
    } catch (error) {
      console.error('[OTA] Error writing raw data:', error.message);
      throw error;
    }
  };

  const sliceAndSend = async () => {
    console.log('[OTA] Starting file upload...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    let totalBytesSent = 0;
    const totalLength = fileLennRef.current;

    for (let start = 0; start < totalLength; start += CHUNK_LENGTH) {
      const end = Math.min(start + CHUNK_LENGTH, totalLength);
      const chunkk = fileContRef.current.slice(start, end);
      try {
        await writeRawData(chunkk);

        totalBytesSent += chunkk.length;
        setProgress(totalBytesSent / totalLength);

        console.log(
          `[OTA] Chunk sent: ${chunkk.length} bytes, Progress: ${Math.round(
            (totalBytesSent / totalLength) * 100,
          )}%`,
        );
      } catch (error) {
        console.error(`[OTA] Error sending chunk: ${error.message}`);
        showToast(
          'error',
          'Upload Failed',
          `Error at ${Math.round((totalBytesSent / totalLength) * 100)}%`,
        );
        setIsUploading(false);
        return;
      }
    }

    await sendEndOfFileTransfer();
  };

  const sendEndOfFileTransfer = async () => {
    try {
      const endOfFileTransfer = Buffer.from([0x06]);
      await writeAddressCharacteristic.writeWithoutResponse(
        endOfFileTransfer.toString('base64'),
      );
      console.log('[OTA] End of file transfer sent.');

      const fileUploadFinished = Buffer.from([0x07]);
      await writeAddressCharacteristic.writeWithoutResponse(
        fileUploadFinished.toString('base64'),
      );
      console.log('[OTA] File upload finished successfully.');

      showToast(
        'success',
        'Success',
        'Firmware upload completed! Device will reboot.',
      );

      // Navigate back to scanner page (EXACTLY like working version)
      navigation.navigate('BLEScan', {
        showSuccessToast: true,
      });
    } catch (error) {
      console.error('[OTA] Error sending end of file transfer:', error.message);
      showToast('error', 'Error', 'Failed to send end of file transfer.');
      setIsUploading(false);
    }
  };

  const handleFileChange = async () => {
    if (isUploading) {
      showToast(
        'info',
        'Upload in Progress',
        'Please wait for current upload to finish',
      );
      return;
    }

    if (!otaSupported) {
      showToast(
        'error',
        'OTA Not Supported',
        'This device does not support OTA updates',
      );
      return;
    }

    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      if (!result || result.length === 0) {
        console.log('[OTA] User cancelled file picker');
        return;
      }

      const file = result[0];
      const fileUri = file.uri;
      const selectedFileSize = file.size;
      const selectedFileName = file.name;

      // Check if same file is selected again
      if (selectedFileName === fileName && selectedFileSize === fileSize) {
        showToast(
          'info',
          'File Already Selected',
          'You already selected this file.',
        );
        return;
      }

      // Validate file extension
      if (!selectedFileName.toLowerCase().endsWith('.bin')) {
        showToast('error', 'Invalid File', 'Please select a .bin file');
        return;
      }

      setFileName(selectedFileName);
      setFileSize(selectedFileSize);

      // Read file content (EXACT MATCH to working version)
      const fileContentBase64 = await RNFS.readFile(fileUri, 'base64');
      const uint8View = Uint8Array.from(atob(fileContentBase64), c =>
        c.charCodeAt(0),
      );

      setFileContent(uint8View);
      fileContRef.current = uint8View;
      const len = uint8View.length;
      fileLennRef.current = uint8View.length;
      setFileLength(len);
      calculateNbSector(len);

      showToast(
        'success',
        'File Ready',
        `${selectedFileName} loaded successfully`,
      );
      console.log(
        `[OTA] File loaded: ${selectedFileName}, Size: ${selectedFileSize} bytes, Sectors: ${nbSector}`,
      );
    } catch (err) {
      if (err.code === 'DOCUMENT_PICKER_CANCELED') {
        console.log('[OTA] User cancelled file picker');
      } else {
        console.error('[OTA] Error while picking or processing file:', err);
        showToast('error', 'File Error', 'Failed to select file.');
      }
    }
  };

  const handleUpload = async () => {
    if (!fileContent.length) {
      showToast('info', 'No File', 'Please select a firmware file first');
      return;
    }

    if (!writeAddressCharacteristic) {
      showToast(
        'error',
        'Error',
        'Address characteristic not available. OTA not supported.',
      );
      return;
    }

    if (!writeWithoutResponseCharacteristic) {
      showToast(
        'error',
        'Error',
        'Data characteristic not available. OTA not supported.',
      );
      return;
    }

    try {
      await writeBaseAddress();
    } catch (error) {
      console.error('[OTA] Error starting upload:', error.message);
      showToast('error', 'Upload Error', 'Failed to start firmware upload.');
    }
  };

  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Show loading state while checking OTA support
  if (!characteristics || !isConnected) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Waiting for device connection...</Text>
      </View>
    );
  }

  // Show OTA not supported message
  if (!otaSupported && isConnected) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: '#FF9500' }]}>
          <Icon name="alert-circle-outline" size={48} color="#FFFFFF" />
          <Text style={styles.infoTitle}>OTA Not Supported</Text>
          <Text style={styles.infoText}>
            This device does not support OTA (Over-The-Air) updates. The
            required BLE characteristics were not found.
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Missing:</Text>
            <Text style={styles.infoValue}>
              {!writeAddressCharacteristic &&
              !writeWithoutResponseCharacteristic
                ? 'OTA Service & Characteristics'
                : !writeAddressCharacteristic
                ? 'Base Address Characteristic (fe22)'
                : 'Data Characteristic (fe24)'}
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.infoCard}>
        <Icon name="cloud-upload-outline" size={24} color="#FFFFFF" />
        <Text style={styles.infoTitle}>OTA Firmware Update</Text>
        <Text style={styles.infoText}>
          Update your device firmware over the air. Select a .bin file and start
          the upload process.
        </Text>
      </View>

      {/* Combined Single Card Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Firmware Update</Text>

        {/* File Selection */}
        <TouchableOpacity
          style={[styles.selectButton, isUploading && styles.disabledButton]}
          onPress={handleFileChange}
          disabled={isUploading}
          activeOpacity={0.8}
        >
          <Icon name="document-outline" size={20} color="#FFFFFF" />
          <Text style={styles.selectButtonText}>
            Select Firmware File (.bin)
          </Text>
        </TouchableOpacity>

        {fileName && (
          <View style={styles.fileInfoContainer}>
            <View style={styles.fileInfoHeader}>
              <OctIcon name="file" size={20} color="#007AFF" />
              <Text style={styles.fileInfoTitle}>File Details</Text>
            </View>
            <View style={styles.fileInfoRow}>
              <Text style={styles.fileInfoLabel}>Name:</Text>
              <Text style={styles.fileInfoValue} numberOfLines={1}>
                {fileName}
              </Text>
            </View>
            <View style={styles.fileInfoRow}>
              <Text style={styles.fileInfoLabel}>Size:</Text>
              <Text style={styles.fileInfoValue}>
                {formatFileSize(fileSize)}
              </Text>
            </View>
            <View style={styles.fileInfoRow}>
              <Text style={styles.fileInfoLabel}>Sectors:</Text>
              <Text style={styles.fileInfoValue}>{nbSector}</Text>
            </View>
            <View style={styles.fileInfoRow}>
              <Text style={styles.fileInfoLabel}>Total Bytes:</Text>
              <Text style={styles.fileInfoValue}>
                {fileLength.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {fileName && !isUploading && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUpload}
            activeOpacity={0.8}
          >
            <MaterialIcon
              name="rocket-launch-outline"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.uploadButtonText}>Start Firmware Upload</Text>
          </TouchableOpacity>
        )}

        {isUploading && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Uploading firmware...</Text>
            <View style={styles.progressBarWrapper}>
              <Progress.Bar
                progress={progress}
                width={null}
                height={8}
                color="#007AFF"
                unfilledColor="#E8ECF0"
                borderWidth={0}
                borderRadius={4}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>{`${Math.round(
                progress * 100,
              )}%`}</Text>
            </View>
            {progress > 0 && (
              <Text style={styles.progressDetail}>
                Uploading {formatFileSize(fileSize)} firmware
              </Text>
            )}
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* OTA Process Steps - Reduced Font Size */}
        <Text style={styles.processTitle}>OTA Process</Text>
        <View style={styles.stepsContainer}>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Select .bin firmware file</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Device prepares for upload</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Firmware uploaded in chunks</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>
              Device reboots with new firmware
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footerInfo}>
        <Icon name="information-circle-outline" size={20} color="#8E9AAB" />
        <Text style={styles.footerText}>
          The device will automatically reboot after successful firmware upload
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E9AAB',
  },
  infoCard: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    width: 100,
  },
  infoValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A2B4C',
    marginBottom: 16,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  fileInfoContainer: {
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  fileInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  fileInfoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A2B4C',
  },
  fileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fileInfoLabel: {
    fontSize: 13,
    color: '#8E9AAB',
  },
  fileInfoValue: {
    fontSize: 13,
    color: '#1A2B4C',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  progressContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF0',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A2B4C',
    marginBottom: 12,
  },
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff',
  },
  progressDetail: {
    fontSize: 12,
    color: '#8E9AAB',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8ECF0',
    marginVertical: 20,
  },
  processTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A2B4C',
    marginBottom: 12,
  },
  stepsContainer: {
    gap: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#238dffaf',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  stepText: {
    fontSize: 13,
    color: '#1A2B4C',
    flex: 1,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 10,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    color: '#8E9AAB',
    lineHeight: 16,
  },
});

export default OTATab;
