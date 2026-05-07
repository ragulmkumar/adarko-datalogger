import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { showToast } from '../utils/ShowToast';

const OTATab = ({ characteristics }) => {
  const [address, setAddress] = useState('');
  const [otaData, setOtaData] = useState('');
  const [isWriting, setIsWriting] = useState(false);

  const writeToCharacteristic = async (
    characteristic,
    value,
    name,
    withResponse = true,
  ) => {
    if (!characteristic) {
      showToast('error', 'Error', `${name} characteristic not available`);
      return false;
    }

    setIsWriting(true);
    try {
      const base64Value = btoa(value);
      if (withResponse) {
        await characteristic.writeWithResponse(base64Value);
      } else {
        await characteristic.writeWithoutResponse(base64Value);
      }
      showToast('success', 'Success', `Written to ${name}`);
      return true;
    } catch (error) {
      console.error(`Error writing to ${name}:`, error);
      showToast('error', 'Error', `Failed to write to ${name}`);
      return false;
    } finally {
      setIsWriting(false);
    }
  };

  const handleWriteAddress = async () => {
    if (!address.trim()) {
      showToast('info', 'Info', 'Please enter an address');
      return;
    }
    await writeToCharacteristic(
      characteristics.writeAddressCharacteristic,
      address,
      'Address',
    );
  };

  const handleWriteWithoutResponse = async () => {
    if (!otaData.trim()) {
      showToast('info', 'Info', 'Please enter OTA data');
      return;
    }
    await writeToCharacteristic(
      characteristics.writeWithoutResponseCharacteristic,
      otaData,
      'OTA Data',
      false,
    );
  };

  const handleWriteWithResponse = async () => {
    if (!otaData.trim()) {
      showToast('info', 'Info', 'Please enter OTA data');
      return;
    }
    await writeToCharacteristic(
      characteristics.writeWithoutResponseCharacteristic,
      otaData,
      'OTA Data',
      true,
    );
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      // Here you would read the file and prepare OTA data
      // For now, just show the file name
      showToast('info', 'File Selected', result[0].name);
      setOtaData(`File: ${result[0].name}`);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled file picker');
      } else {
        console.error('Error picking file:', err);
        showToast('error', 'Error', 'Failed to pick file');
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>OTA Service Information</Text>
        <Text style={styles.infoText}>
          Service UUID: 0000fe20-cc7a-482a-984a-7f2ed5b3e58f
        </Text>
        <Text style={styles.infoText}>
          MTU Size: {characteristics.mtu || 243}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Write Address Characteristic</Text>
        <Text style={styles.sectionSubtitle}>
          UUID: 0000fe22-cc7a-482a-984a-7f2ed5b3e58f
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter address value"
          value={address}
          onChangeText={setAddress}
        />

        <TouchableOpacity
          style={styles.writeButton}
          onPress={handleWriteAddress}
          disabled={isWriting}
        >
          {isWriting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Write Address</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>OTA Data Characteristic</Text>
        <Text style={styles.sectionSubtitle}>
          UUID: 0000fe24-cc7a-482a-984a-7f2ed5b3e58f
        </Text>

        <TouchableOpacity style={styles.pickFileButton} onPress={pickFile}>
          <Text style={styles.buttonText}>Pick OTA File</Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter OTA data or select file"
          value={otaData}
          onChangeText={setOtaData}
          multiline
          numberOfLines={4}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.writeButton, styles.writeWithoutResponse]}
            onPress={handleWriteWithoutResponse}
            disabled={isWriting}
          >
            <Text style={styles.buttonText}>Write Without Response</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.writeButton, styles.writeWithResponse]}
            onPress={handleWriteWithResponse}
            disabled={isWriting}
          >
            <Text style={styles.buttonText}>Write With Response</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Indicate Characteristic</Text>
        <Text style={styles.sectionSubtitle}>
          UUID: 0000fe23-cc7a-482a-984a-7f2ed5b3e58f
        </Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>
            This characteristic is set up to monitor notifications
            automatically. Any incoming notifications will be displayed as
            toasts.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  writeButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
    flex: 1,
    marginHorizontal: 4,
  },
  writeWithoutResponse: {
    backgroundColor: '#FF9500',
  },
  writeWithResponse: {
    backgroundColor: '#34C759',
  },
  pickFileButton: {
    backgroundColor: '#5856D6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  infoBoxText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});

export default OTATab;
