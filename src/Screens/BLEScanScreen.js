import React, { useState, useEffect, useRef } from 'react';
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

const BLEScanScreen = () => {
  const [devices, setDevices] = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [bluetoothReady, setBluetoothReady] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const scanTimeoutRef = useRef(null);
  const bluetoothManager = useRef(null);

  const requestBluetoothPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
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
        return granted;
      } catch (err) {
        return false;
      }
    }
    setPermissionsGranted(true);
    return true;
  };

  const initBluetooth = async () => {
    try {
      const hasPermission = await requestBluetoothPermissions();
      if (!hasPermission) {
        showToast(
          'error',
          'Permission Denied',
          'Bluetooth permissions are required',
        );
        return false;
      }
      bluetoothManager.current = BluetoothManager.getInstance();
      setBluetoothReady(true);
      return true;
    } catch (error) {
      showToast('error', 'Error', 'Failed to initialize Bluetooth');
      return false;
    }
  };

  useEffect(() => {
    initBluetooth();
    return () => {
      stopScan();
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };
  }, []);

  // Check for success toast parameter
  useEffect(() => {
    if (route.params?.showSuccessToast) {
      showToast(
        'success',
        'OTA Complete',
        'Firmware update completed successfully!',
      );
      // Clear the parameter to prevent showing toast again
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
      showToast('error', 'Error', 'Bluetooth not ready, please try again');
      const initialized = await initBluetooth();
      if (!initialized) return;
    }

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
            setDevices(prevDevices => {
              const existingDevice = prevDevices[device.id];
              if (!existingDevice || existingDevice.rssi !== device.rssi) {
                return {
                  ...prevDevices,
                  [device.id]: {
                    id: device.id,
                    name: device.name || 'Unknown Device',
                    rssi: device.rssi || -100,
                    localName: device.localName,
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

  const getSignalStrength = rssi => {
    if (rssi > -60) return { text: 'Excellent', color: '#34C759', bars: 4 };
    if (rssi > -70) return { text: 'Good', color: '#FFD60A', bars: 3 };
    if (rssi > -80) return { text: 'Fair', color: '#FF9500', bars: 2 };
    return { text: 'Poor', color: '#FF3B30', bars: 1 };
  };

  const renderDevice = ({ item }) => {
    const signal = getSignalStrength(item.rssi);

    return (
      <TouchableOpacity
        style={styles.deviceCard}
        onPress={() => connectToDevice(item.id, item.name)}
        activeOpacity={0.7}
      >
        <View style={styles.deviceIconContainer}>
          <View style={styles.deviceIcon}>
            <Icon name="bluetooth" size={28} color="#007AFF" />
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
            <View style={styles.signalBars}>
              {[1, 2, 3, 4].map(bar => (
                <View
                  key={bar}
                  style={[
                    styles.signalBar,
                    { height: 4 + bar * 2 },
                    bar <= signal.bars && { backgroundColor: signal.color },
                    bar > signal.bars && { backgroundColor: '#ddd' },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.signalText, { color: signal.color }]}>
              {signal.text} ({item.rssi} dBm)
            </Text>
          </View>
        </View>

        <View style={styles.connectButton}>
          <Text style={styles.connectButtonText}>Connect</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="search" size={48} color="#007AFF" />
      </View>
      <Text style={styles.emptyTitle}>
        {isScanning ? 'Scanning for devices...' : 'No Devices Found'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {isScanning
          ? 'Looking for nearby BLE devices'
          : 'Tap Start Scan to search for devices'}
      </Text>
      {!isScanning && !bluetoothReady && (
        <TouchableOpacity
          style={styles.emptyScanButton}
          onPress={initBluetooth}
        >
          <Text style={styles.emptyScanButtonText}>Initialize Bluetooth</Text>
        </TouchableOpacity>
      )}
      {!isScanning && bluetoothReady && (
        <TouchableOpacity style={styles.emptyScanButton} onPress={startScan}>
          <Text style={styles.emptyScanButtonText}>Start Scan</Text>
        </TouchableOpacity>
      )}
      {isScanning && (
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ marginTop: 20 }}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>BLE Device Scanner</Text>
          <Text style={styles.headerSubtitle}>
            {Object.keys(devices).length} device
            {Object.keys(devices).length !== 1 ? 's' : ''} found
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.scanButton,
            isScanning && styles.scanningButton,
            (!permissionsGranted || !bluetoothReady) && styles.disabledButton,
          ]}
          onPress={isScanning ? stopScan : startScan}
          disabled={!permissionsGranted || !bluetoothReady}
        >
          {isScanning ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.scanButtonText}>Stop</Text>
            </>
          ) : (
            <>
              <Icon name="scan" size={18} color="#FFFFFF" />
              <Text style={styles.scanButtonText}>Scan</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2B4C',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7A8F',
    marginTop: 2,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  scanningButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#C0C8D2',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  deviceIconContainer: {
    marginRight: 14,
  },
  deviceIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2B4C',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 11,
    color: '#8E9AAB',
    marginBottom: 6,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    marginRight: 8,
  },
  signalBar: {
    width: 4,
    borderRadius: 2,
  },
  signalText: {
    fontSize: 11,
    fontWeight: '500',
  },
  connectButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A2B4C',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E9AAB',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyScanButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyScanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BLEScanScreen;
