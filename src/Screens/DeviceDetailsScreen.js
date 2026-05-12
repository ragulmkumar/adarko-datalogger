import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useBluetoothCharacteristics } from '../utils/useBluetoothCharacteristics';
import OTATab from '../Components/OTATab';
import ConfigurationTab from '../Components/ConfigurationTab';
import UserConfig from '../utils/ParseConfig';
import { showToast } from '../utils/ShowToast';
import BluetoothManager from '../../BluetoothManager';

const DeviceDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { deviceId: routeDeviceId, deviceName: routeDeviceName } = route.params;
  const deviceId = routeDeviceId?.id ?? routeDeviceId;
  const deviceName = routeDeviceName?.name ?? routeDeviceName;
  const [activeTab, setActiveTab] = useState('configuration');
  const [configData, setConfigData] = useState([]);
  const [parsedConfig, setParsedConfig] = useState(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasConnectedOnce, setHasConnectedOnce] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [bluetoothStatus, setBluetoothStatus] = useState('PoweredOn');

  // Track ongoing operations in tabs
  const [isWritingConfig, setIsWritingConfig] = useState(false);
  const [isUploadingOTA, setIsUploadingOTA] = useState(false);

  // Refs to track state
  const isManualDisconnectRef = useRef(false);
  const bluetoothManagerRef = useRef(null);
  const stateMonitorRef = useRef(null);
  const isMountedRef = useRef(true);

  const handleDisconnect = async () => {
    if (isDisconnecting) return;

    isManualDisconnectRef.current = true;
    setIsDisconnecting(true);
    setShowDisconnectModal(false);

    try {
      await BluetoothManager.getInstance().disconnectDevice(deviceId);
      setIsConnected(false);
      showToast('info', 'Disconnected', `Disconnected from ${deviceName}`);
      if (isMountedRef.current) {
        navigation.goBack();
      }
    } catch (error) {
      showToast('error', 'Error', 'Failed to disconnect');
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Monitor Bluetooth state changes and unexpected disconnections
  useEffect(() => {
    isMountedRef.current = true;
    bluetoothManagerRef.current = BluetoothManager.getInstance();

    const setupBluetoothMonitoring = async () => {
      if (!bluetoothManagerRef.current) return;

      try {
        // Check initial Bluetooth state
        const initialState =
          await bluetoothManagerRef.current.getBluetoothState();
        if (isMountedRef.current) {
          setBluetoothStatus(initialState);
        }

        // Monitor Bluetooth state changes
        bluetoothManagerRef.current.monitorBluetoothState(state => {
          if (isMountedRef.current) {
            setBluetoothStatus(state);
            console.log('[DeviceDetails] Bluetooth state changed to:', state);

            // If Bluetooth is turned off while on device details page
            if (
              state === 'PoweredOff' &&
              isConnected &&
              !isManualDisconnectRef.current
            ) {
              console.log(
                '[DeviceDetails] Bluetooth turned off - navigating back',
              );

              // Check for ongoing operations
              const hasOngoingOperations = isWritingConfig || isUploadingOTA;

              let message = 'Bluetooth has been disabled.';
              let title = 'Bluetooth Off';

              if (hasOngoingOperations) {
                if (isWritingConfig) {
                  title = 'Configuration Interrupted';
                  message =
                    'Bluetooth disabled during configuration update. Changes may not have been saved.';
                } else if (isUploadingOTA) {
                  title = 'OTA Update Interrupted';
                  message =
                    'Bluetooth disabled during firmware update. Update was interrupted and may need to be restarted.';
                }
              } else {
                message += ' Returning to scan screen.';
              }

              showToast('warning', title, message);

              // Reset ongoing operation states
              setIsWritingConfig(false);
              setIsUploadingOTA(false);

              setTimeout(
                () => {
                  if (isMountedRef.current) {
                    navigation.goBack();
                  }
                },
                hasOngoingOperations ? 1500 : 500,
              );
            }
          }
        });
      } catch (error) {
        console.error(
          '[DeviceDetails] Error setting up Bluetooth monitoring:',
          error,
        );
      }
    };

    setupBluetoothMonitoring();

    return () => {
      isMountedRef.current = false;
      if (bluetoothManagerRef.current) {
        bluetoothManagerRef.current.stopMonitoringBluetoothState();
      }
    };
  }, []);

  // Handle unexpected device disconnection
  useEffect(() => {
    if (
      hasConnectedOnce &&
      !isConnected &&
      !isManualDisconnectRef.current &&
      !isDisconnecting
    ) {
      console.log('[DeviceDetails] Device disconnected unexpectedly');

      // Check if there are ongoing operations
      const hasOngoingOperations = isWritingConfig || isUploadingOTA;

      let message = `${deviceName} has disconnected unexpectedly.`;
      let title = 'Device Disconnected';

      if (hasOngoingOperations) {
        if (isWritingConfig) {
          title = 'Configuration Interrupted';
          message = `${deviceName} disconnected during configuration update. Changes may not have been saved.`;
        } else if (isUploadingOTA) {
          title = 'OTA Update Interrupted';
          message = `${deviceName} disconnected during firmware update. Update was interrupted and may need to be restarted.`;
        }
      } else {
        message += ' Returning to scan screen.';
      }

      showToast('warning', title, message);

      // Reset ongoing operation states
      setIsWritingConfig(false);
      setIsUploadingOTA(false);

      setTimeout(
        () => {
          if (isMountedRef.current) {
            navigation.goBack();
          }
        },
        hasOngoingOperations ? 1500 : 800,
      ); // Longer delay for operations
    }
  }, [
    hasConnectedOnce,
    isConnected,
    navigation,
    deviceName,
    isWritingConfig,
    isUploadingOTA,
  ]);

  const handleNotification = useCallback((value, type = 'ota') => {
    const timestamp = new Date();
    console.log(
      `[${timestamp.toLocaleTimeString()}] Notification received - Type: ${type}`,
    );

    let bytes = null;

    if (typeof value === 'string') {
      try {
        const binaryString = atob(value);
        bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
      } catch (e) {
        console.error('Failed to decode base64:', e);
        return;
      }
    } else if (value instanceof Uint8Array) {
      bytes = value;
    } else if (value && typeof value === 'object') {
      if (value.value && typeof value.value === 'string') {
        try {
          const binaryString = atob(value.value);
          bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
        } catch (e) {
          console.error('Failed to decode value.value:', e);
          return;
        }
      } else if (value.data && typeof value.data === 'string') {
        try {
          const binaryString = atob(value.data);
          bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
        } catch (e) {
          console.error('Failed to decode value.data:', e);
          return;
        }
      }
    }

    if (!bytes || bytes.length === 0) {
      console.log('No bytes to process');
      return;
    }

    const bytesToHexDisplay = bytesArray => {
      return Array.from(bytesArray)
        .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
        .join(' ');
    };

    if (type === 'config') {
      const hexDisplay = bytesToHexDisplay(bytes);
      console.log(`Received ${bytes.length} bytes of config data:`, hexDisplay);

      setConfigData(prev => {
        const newData = [{ timestamp: new Date(), data: hexDisplay }, ...prev];
        return newData.slice(0, 50);
      });

      // FIXED: Check for 125 bytes (not 123)
      if (bytes.length === 125) {
        try {
          const hexString = hexDisplay.replace(/ /g, '');
          const config = UserConfig.fromHex(hexString);

          console.log('=== Parsed Configuration ===');
          config.print();

          setParsedConfig(config);
          showToast(
            'success',
            'Config Updated',
            `Configuration received - FW: ${UserConfig.formatVersionBCD(
              config.fw_version,
            )}, HW: ${UserConfig.formatVersionBCD(config.hw_version)}`,
          );
        } catch (parseError) {
          console.error('Parse error:', parseError);
          showToast(
            'error',
            'Parse Error',
            'Failed to parse configuration data',
          );
        }
      } else {
        console.log(
          `Expected 125 bytes, got ${bytes.length} bytes. Waiting for full config packet.`,
        );
      }
    }
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      isManualDisconnectRef.current = false;
      if (bluetoothManagerRef.current) {
        bluetoothManagerRef.current.stopMonitoringBluetoothState();
      }
    };
  }, []);

  useEffect(() => {
    if (isConnected) {
      setHasConnectedOnce(true);
    }
  }, [isConnected]);

  const characteristics = useBluetoothCharacteristics(
    deviceId,
    handleNotification,
    activeTab,
    connected => setIsConnected(connected),
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        isConnected ? (
          <TouchableOpacity
            onPress={() => setShowDisconnectModal(true)}
            disabled={isDisconnecting}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            {isDisconnecting ? (
              <ActivityIndicator size="small" color="#FF3B30" />
            ) : (
              <MaterialIcons
                name="bluetooth-disabled"
                size={24}
                color="#FF3B30"
              />
            )}
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, isConnected, isDisconnecting]);

  const DisconnectModal = () => (
    <Modal
      visible={showDisconnectModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowDisconnectModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowDisconnectModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <View style={styles.modalIconCircle}>
                  <MaterialIcons
                    name="bluetooth-disabled"
                    size={32}
                    color="#FF3B30"
                  />
                </View>
              </View>

              <Text style={styles.modalTitle}>Disconnect Device</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to disconnect from{' '}
                {deviceName || 'this device'}?
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowDisconnectModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.disconnectButton]}
                  onPress={handleDisconnect}
                >
                  <MaterialIcons
                    name="bluetooth-disabled"
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.disconnectButtonText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  if (!characteristics.isConnected && characteristics.device === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Connecting to device...</Text>
        <Text style={styles.loadingSubText}>Please wait</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Updated Header with Left and Right alignment */}
      <View style={styles.header}>
        <View style={styles.deviceInfoContainer}>
          <View style={styles.deviceAvatar}>
            <Icon name="hardware-chip" size={28} color="#007AFF" />
          </View>
          <Text style={styles.deviceName}>
            {deviceName || 'Unknown Device'}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              characteristics.isConnected && styles.connected,
            ]}
          />
          <Text style={styles.statusText}>
            {characteristics.isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>
      {/* Updated Centered Tabs */}
      <View style={styles.tabContainer}>
        <View style={styles.tabsWrapper}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'configuration' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('configuration')}
          >
            <Icon
              name="settings-outline"
              size={20}
              color={activeTab === 'configuration' ? '#007AFF' : '#8E9AAB'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'configuration' && styles.activeTabText,
              ]}
            >
              Configuration
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'ota' && styles.activeTab]}
            onPress={() => setActiveTab('ota')}
          >
            <Icon
              name="cloud-upload-outline"
              size={20}
              color={activeTab === 'ota' ? '#007AFF' : '#8E9AAB'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'ota' && styles.activeTabText,
              ]}
            >
              OTA Update
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'configuration' && (
          <ConfigurationTab
            characteristics={characteristics}
            configData={configData}
            parsedConfig={parsedConfig}
            onWritingStateChange={setIsWritingConfig}
          />
        )}
        {activeTab === 'ota' && (
          <OTATab
            characteristics={characteristics}
            onUploadingStateChange={setIsUploadingOTA}
          />
        )}
      </ScrollView>

      <DisconnectModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2B4C',
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 13,
    color: '#8E9AAB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  deviceInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A2B4C',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 6,
  },
  connected: {
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A2B4C',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  tabsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center', // Centers the tabs
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24, // Increased horizontal padding for better spacing
    gap: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E9AAB',
  },
  activeTabText: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A2B4C',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#5A6B7D',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#5A6B7D',
  },
  disconnectButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    gap: 8,
  },
  disconnectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default DeviceDetailsScreen;
