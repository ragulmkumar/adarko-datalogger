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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BluetoothManager from '../../BluetoothManager';
import { showToast } from '../utils/ShowToast';

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

      const currentState = await bluetoothManager.current.getBluetoothState();
      setBluetoothStatus(currentState);

      if (currentState === 'PoweredOff') {
        setShowBluetoothOffModal(true);
        setBluetoothReady(false);
      } else if (currentState === 'PoweredOn') {
        setBluetoothReady(true);
        setShowBluetoothOffModal(false);
      } else {
        setBluetoothReady(false);
      }

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
      await initBluetooth();
    };

    autoInit();

    return () => {
      stopScan();
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      if (bluetoothManager.current) {
        bluetoothManager.current.stopMonitoringBluetoothState();
      }
    };
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
        'Could not open Bluetooth settings. Please enable Bluetooth manually.',
      );
    }
  };

  const renderDevice = ({ item }) => {
    const signalColor =
      item.rssi > -50
        ? '#34C759'
        : item.rssi > -70
        ? '#FFA230'
        : item.rssi > -90
        ? '#FF9500'
        : '#FF3B30';

    return (
      <TouchableOpacity
        style={styles.deviceCard}
        onPress={() => connectToDevice(item.id, item.name)}
        activeOpacity={0.7}
      >
        <View style={styles.deviceIconContainer}>
          <View style={styles.deviceIcon}>
            <MaterialCommunityIcons name="chip" size={28} color="#007AFF" />
          </View>
        </View>

        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.deviceId} numberOfLines={1}>
            {item.id}
          </Text>
          <View style={styles.signalContainer}>
            <View
              style={[styles.signalDot, { backgroundColor: signalColor }]}
            />
            <Text style={styles.rssiValue}>({item.rssi} dBm)</Text>
          </View>
        </View>

        <View style={styles.connectButton}>
          <Text style={styles.connectButtonText}>Connect</Text>
          <Icon name="arrow-forward" size={14} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons
          name="bluetooth-off"
          size={48}
          color="#C0C8D2"
        />
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
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="bluetooth" size={20} color="#FFFFFF" />
          <Text style={styles.emptyScanButtonText}>Initialize Bluetooth</Text>
        </TouchableOpacity>
      )}
      {!isScanning && bluetoothReady && (
        <TouchableOpacity
          style={styles.emptyScanButton}
          onPress={startScan}
          activeOpacity={0.8}
        >
          <Icon name="search" size={20} color="#FFFFFF" />
          <Text style={styles.emptyScanButtonText}>Start Scan</Text>
        </TouchableOpacity>
      )}
      {isScanning && (
        <>
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={{ marginTop: 24 }}
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
        backgroundColor="#F8F9FC"
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

      {/* Floating Scan Button - Fixed to show proper stop icon */}
      {bluetoothReady && (
        <TouchableOpacity
          style={[styles.floatingButton, isScanning && styles.scanningButton]}
          onPress={isScanning ? stopScan : startScan}
          activeOpacity={0.8}
        >
          {isScanning ? (
            <>
              <Icon name="stop" size={28} color="#FFFFFF" />
              {isScanning && (
                <View style={styles.scanningPulse}>
                  <View style={styles.pulseRing} />
                </View>
              )}
            </>
          ) : (
            <MaterialCommunityIcons
              name="bluetooth"
              size={28}
              color="#FFFFFF"
            />
          )}
        </TouchableOpacity>
      )}

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
              <View style={styles.modalIconCircle}>
                <MaterialCommunityIcons
                  name="bluetooth-off"
                  size={40}
                  color="#FF3B30"
                />
              </View>
            </View>

            <Text style={styles.modalTitle}>Bluetooth is Off</Text>
            <Text style={styles.modalMessage}>
              Please enable Bluetooth to scan for and connect to BLE devices.
            </Text>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalSettingsButton}
                onPress={openBluetoothSettings}
                activeOpacity={0.8}
              >
                <Icon name="settings" size={18} color="#FFFFFF" />
                <Text style={styles.modalSettingsButtonText}>
                  Open Bluetooth Settings
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowBluetoothOffModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  mainContainer: {
    flex: 1,
  },
  // List Container
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  // Device Card
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  deviceIconContainer: {
    marginRight: 16,
  },
  deviceIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#007AFF15',
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
    letterSpacing: 0.3,
  },
  deviceId: {
    fontSize: 11,
    color: '#8E9AAB',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rssiText: {
    fontSize: 11,
    color: '#5A6B7D',
    fontWeight: '500',
  },
  rssiValue: {
    fontSize: 10,
    color: '#8E9AAB',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  // Floating Button
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
    shadowRadius: 8,
    elevation: 8,
  },
  scanningButton: {
    backgroundColor: '#FF3B30',
  },
  scanningPulse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  pulseRing: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#FF3B30',
    opacity: 0.5,
    animation: 'pulse 1.5s ease-out infinite',
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2B4C',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E9AAB',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  emptyScanButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
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
    fontSize: 15,
    fontWeight: '600',
  },
  scanningText: {
    marginTop: 20,
    fontSize: 13,
    color: '#8E9AAB',
    fontWeight: '500',
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
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
    fontSize: 17,
    color: '#1A2B4C',
    fontWeight: '700',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 13,
    color: '#8E9AAB',
    textAlign: 'center',
  },
  // Modal Styles
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
    marginBottom: 20,
  },
  modalIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
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
    lineHeight: 20,
  },
  modalButtonContainer: {
    width: '100%',
    gap: 12,
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
    fontSize: 15,
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
    backgroundColor: '#F8F9FC',
  },
  modalCancelButtonText: {
    color: '#6B7A8F',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BLEScanScreen;
