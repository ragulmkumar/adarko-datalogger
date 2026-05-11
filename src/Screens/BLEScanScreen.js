import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
  PermissionsAndroid,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import BluetoothManager from '../../BluetoothManager';
import { showToast } from '../utils/ShowToast';

const ScanControlBar = ({
  devices,
  isScanning,
  permissionsGranted,
  bluetoothReady,
  startScan,
  stopScan,
}) => (
  <View style={styles.controlBar}>
    <View style={styles.deviceCountContainer}>
      <Icon name="file-tray-full" size={20} color="#6B7A8F" />
      <Text style={styles.deviceCountText}>
        {Object.keys(devices).length} Devices Found
      </Text>
    </View>
    <TouchableOpacity
      style={[
        styles.actionButton,
        isScanning && styles.stopButton,
        (!permissionsGranted || !bluetoothReady) && styles.disabledButton,
      ]}
      onPress={isScanning ? stopScan : startScan}
      disabled={!permissionsGranted || !bluetoothReady}
    >
      <Icon
        name={isScanning ? 'stop-circle' : 'search'}
        size={20}
        color="#FFFFFF"
      />
      <Text style={styles.actionButtonText}>
        {isScanning ? 'Stop Scanning' : 'Start Scanning'}
      </Text>
    </TouchableOpacity>
  </View>
);

const FloatingScanButton = ({
  isScanning,
  permissionsGranted,
  bluetoothReady,
  startScan,
  stopScan,
}) => (
  <TouchableOpacity
    style={[
      styles.floatingButton,
      isScanning && styles.scanningButton,
      (!permissionsGranted || !bluetoothReady) && styles.disabledButton,
    ]}
    onPress={isScanning ? stopScan : startScan}
    disabled={!permissionsGranted || !bluetoothReady}
  >
    {isScanning ? (
      <ActivityIndicator color="#FFFFFF" size={24} />
    ) : (
      <Icon name="bluetooth" size={28} color="#FFFFFF" />
    )}
  </TouchableOpacity>
);

const BLEScanScreen = () => {
  const [devices, setDevices] = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [requestingPermissions, setRequestingPermissions] = useState(false);
  const [bluetoothReady, setBluetoothReady] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [bluetoothStatus, setBluetoothStatus] = useState('Unknown');
  const [showBluetoothOffModal, setShowBluetoothOffModal] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const scanTimeoutRef = useRef(null);
  const bluetoothManager = useRef(null);

  const requestBluetoothPermissions = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        setRequestingPermissions(true);
        let granted = false;
        if (Platform.Version >= 31) {
          const permissions = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);
          granted =
            permissions['android.permission.BLUETOOTH_SCAN'] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            permissions['android.permission.BLUETOOTH_CONNECT'] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            permissions['android.permission.ACCESS_FINE_LOCATION'] ===
              PermissionsAndroid.RESULTS.GRANTED;
        } else {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          granted = result === PermissionsAndroid.RESULTS.GRANTED;
        }
        setPermissionsGranted(granted);
        setRequestingPermissions(false);
        return granted;
      } catch (err) {
        setRequestingPermissions(false);
        return false;
      }
    }
    setPermissionsGranted(true);
    return true;
  }, []);

  const initBluetooth = useCallback(async () => {
    try {
      setInitializing(true);
      const hasPermission = await requestBluetoothPermissions();
      if (!hasPermission) {
        showToast(
          'error',
          'Permission Denied',
          'Bluetooth permissions are required',
        );
        setInitializing(false);
        return false;
      }
      bluetoothManager.current = BluetoothManager.getInstance();

      // Check Bluetooth state and start monitoring
      const currentState = await bluetoothManager.current.getBluetoothState();
      setBluetoothStatus(currentState);

      // Show modal if Bluetooth is off
      if (currentState === 'PoweredOff') {
        setShowBluetoothOffModal(true);
        setBluetoothReady(false);
      } else if (currentState === 'PoweredOn') {
        setBluetoothReady(true);
        setShowBluetoothOffModal(false);
      } else {
        // For other states like Unknown, Unsupported, etc.
        setBluetoothReady(false);
      }

      // Monitor Bluetooth state changes
      bluetoothManager.current.monitorBluetoothState(state => {
        setBluetoothStatus(state);

        if (state === 'PoweredOff') {
          setShowBluetoothOffModal(true);
          setBluetoothReady(false);
          stopScan();
        } else if (state === 'PoweredOn') {
          setBluetoothReady(true);
          setShowBluetoothOffModal(false);
        } else {
          setBluetoothReady(false);
        }
      });

      setInitializing(false);
      return true;
    } catch (error) {
      showToast('error', 'Error', 'Failed to initialize Bluetooth');
      setInitializing(false);
      return false;
    }
  }, [requestBluetoothPermissions]);

  useEffect(() => {
    const autoInit = async () => {
      const initialized = await initBluetooth();
      if (initialized) {
        // Optionally auto-start scan after initialization
      }
    };

    autoInit();

    return () => {
      stopScan();
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      // Clean up Bluetooth state monitoring
      if (bluetoothManager.current) {
        bluetoothManager.current.stopMonitoringBluetoothState();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (route.params?.showSuccessToast) {
      showToast(
        'success',
        'OTA Complete',
        'Firmware update completed successfully!',
      );
      navigation.setParams({ showSuccessToast: undefined });
    }
  }, [route.params?.showSuccessToast, navigation]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        stopScan();
      };
    }, []),
  );

  const startScan = async () => {
    if (!bluetoothReady || !bluetoothManager.current) {
      showToast(
        'error',
        'Error',
        'Bluetooth not ready. Please initialize Bluetooth first.',
      );
      return;
    }

    // SILENT filter - only shows devices starting with "DL" but never mentions it in UI
    const filterPrefix = 'DL';

    setDevices({});
    setIsScanning(true);
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);

    try {
      const manager = bluetoothManager.current;
      if (!manager) {
        showToast('error', 'Error', 'Bluetooth manager not available');
        setIsScanning(false);
        return;
      }

      manager.startScan(
        device => {
          if (device && device.name) {
            const deviceName = device.name.trim();
            // SILENT filter - no UI mention of DL
            if (!deviceName.toUpperCase().startsWith(filterPrefix)) {
              return;
            }

            setDevices(prevDevices => {
              const existingDevice = prevDevices[device.id];
              if (!existingDevice || existingDevice.rssi !== device.rssi) {
                return {
                  ...prevDevices,
                  [device.id]: {
                    id: device.id,
                    name: deviceName,
                    rssi: device.rssi || -100,
                  },
                };
              }
              return prevDevices;
            });
          }
        },
        error => {
          showToast('error', 'Scan Error', 'Failed to scan for devices');
          setIsScanning(false);
        },
      );

      scanTimeoutRef.current = setTimeout(() => {
        if (isScanning) {
          stopScan();
          if (Object.keys(devices).length === 0) {
            showToast(
              'info',
              'No Devices',
              'No BLE devices found. Make sure your device is advertising.',
            );
          }
        }
      }, 15000);
    } catch (error) {
      showToast('error', 'Scan Error', 'Failed to start scanning');
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    try {
      const manager = bluetoothManager.current;
      if (manager && typeof manager.stopScan === 'function') {
        manager.stopScan();
      }
    } catch (error) {}
    setIsScanning(false);
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await startScan();
    setRefreshing(false);
  };

  const connectToDevice = async (deviceId, deviceName) => {
    stopScan();
    navigation.navigate('DeviceDetails', {
      deviceId,
      deviceName: deviceName || 'BLE Device',
    });
  };

  const openBluetoothSettings = async () => {
    try {
      if (bluetoothManager.current) {
        showToast(
          'info',
          'Opening Settings',
          'Redirecting to Bluetooth settings...',
        );
        await bluetoothManager.current.openBluetoothSettings();
      }
    } catch (error) {
      console.error('Error opening Bluetooth settings:', error);
      showToast(
        'error',
        'Settings Error',
        'Could not open Bluetooth settings. Please enable Bluetooth manually in your device Settings.',
      );
    }
  };

  // Static color
  const staticColor = '#007AFF';

  const renderDevice = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.deviceCard}
        onPress={() => connectToDevice(item.id, item.name)}
        activeOpacity={0.7}
      >
        <View style={styles.deviceIconContainer}>
          <View
            style={[styles.deviceIcon, { backgroundColor: `${staticColor}15` }]}
          >
            <Icon name="bluetooth" size={28} color={staticColor} />
          </View>
        </View>

        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.deviceId} numberOfLines={1}>
            {item.id.substring(0, 20)}...
          </Text>
          <View style={styles.signalContainer}>
            <Text style={styles.rssiText}>RSSI: {item.rssi} dBm</Text>
          </View>
        </View>

        <View style={[styles.connectButton, { backgroundColor: staticColor }]}>
          <Text style={styles.connectButtonText}>Connect</Text>
          <Icon
            name="arrow-forward"
            size={16}
            color="#FFFFFF"
            style={styles.connectIcon}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="bluetooth" size={48} color="#007AFF" />
      </View>
      <Text style={styles.emptyTitle}>
        {isScanning ? 'Scanning for devices...' : 'No Devices Found'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {isScanning
          ? 'Looking for nearby BLE devices'
          : 'No compatible devices found nearby'}
      </Text>
      {!isScanning && !bluetoothReady && (
        <TouchableOpacity
          style={styles.emptyScanButton}
          onPress={initBluetooth}
        >
          <Icon name="bluetooth" size={20} color="#FFFFFF" />
          <Text style={styles.emptyScanButtonText}>Initialize Bluetooth</Text>
        </TouchableOpacity>
      )}
      {!isScanning && bluetoothReady && (
        <TouchableOpacity style={styles.emptyScanButton} onPress={startScan}>
          <Icon name="search" size={20} color="#FFFFFF" />
          <Text style={styles.emptyScanButtonText}>Start Scan</Text>
        </TouchableOpacity>
      )}
      {isScanning && (
        <>
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={{ marginTop: 20 }}
          />
          <Text style={styles.scanningText}>Scanning nearby devices...</Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle={requestingPermissions ? 'light-content' : 'dark-content'}
        backgroundColor={requestingPermissions ? '#000000' : '#F5F7FA'}
      />

      <View style={styles.mainContainer}>
        {initializing ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Initializing Bluetooth...</Text>
              <Text style={styles.loadingSubtext}>
                Please wait while we set up Bluetooth
              </Text>
            </View>
          </View>
        ) : (
          <>
            <ScanControlBar
              devices={devices}
              isScanning={isScanning}
              permissionsGranted={permissionsGranted}
              bluetoothReady={bluetoothReady}
              startScan={startScan}
              stopScan={stopScan}
            />

            <FlatList
              data={Object.values(devices).sort((a, b) => b.rssi - a.rssi)}
              keyExtractor={item => item.id}
              renderItem={renderDevice}
              ListEmptyComponent={renderEmptyState}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#007AFF"
                  colors={['#007AFF']}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>

      <FloatingScanButton
        isScanning={isScanning}
        permissionsGranted={permissionsGranted}
        bluetoothReady={bluetoothReady}
        startScan={startScan}
        stopScan={stopScan}
      />

      {/* Bluetooth Off Modal */}
      <Modal
        visible={showBluetoothOffModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBluetoothOffModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Icon name="bluetooth" size={60} color="#FF3B30" />
              <View style={styles.modalWarningBadge}>
                <Icon name="alert-circle" size={24} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.modalTitle}>Bluetooth is Off</Text>
            <Text style={styles.modalMessage}>
              Please enable Bluetooth to scan for and connect to BLE devices.
              Tap the button below to open Bluetooth settings.
            </Text>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalSettingsButton}
                onPress={openBluetoothSettings}
              >
                <Icon name="settings" size={18} color="#FFFFFF" />
                <Text style={styles.modalSettingsButtonText}>
                  Open Bluetooth Settings
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowBluetoothOffModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHint}>
              You can also check Bluetooth status in your device settings.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  mainContainer: {
    flex: 1,
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deviceCountText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A2B4C',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  stopButton: {
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  scanningButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#C0C8D2',
    shadowOpacity: 0,
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  deviceIconContainer: {
    marginRight: 16,
  },
  deviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2B4C',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 11,
    color: '#8E9AAB',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rssiText: {
    fontSize: 11,
    color: '#6B7A8F',
    fontWeight: '500',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  connectIcon: {
    marginLeft: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2B4C',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#8E9AAB',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  emptyScanButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyScanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scanningText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7A8F',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginHorizontal: 32,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#1A2B4C',
    fontWeight: '700',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 13,
    color: '#8E9AAB',
    textAlign: 'center',
  },
  // Bluetooth Off Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  modalWarningBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A2B4C',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#6B7A8F',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 21,
  },
  modalButtonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  modalSettingsButton: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  modalSettingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FA',
  },
  modalCancelButtonText: {
    color: '#6B7A8F',
    fontSize: 15,
    fontWeight: '600',
  },
  modalHint: {
    fontSize: 12,
    color: '#8E9AAB',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default BLEScanScreen;
