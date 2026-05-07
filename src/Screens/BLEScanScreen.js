import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BluetoothManager from '../../BluetoothManager';
import { showToast } from '../utils/ShowToast';
import { requestPermissions } from '../utils/Permissions';

const { width } = Dimensions.get('window');

const BLEScanScreen = () => {
  const [devices, setDevices] = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const navigation = useNavigation();
  const manager = BluetoothManager.getInstance();

  useEffect(() => {
    startScan();
    return () => {
      stopScan();
      BluetoothManager.destroyInstance();
    };
  }, []);

  const startScan = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      showToast(
        'error',
        'Permission Denied',
        'Bluetooth permissions are required',
      );
      return;
    }

    setDevices({});
    setIsScanning(true);

    try {
      // Start scanning for devices
      manager.startDeviceScan(
        null,
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error('Scan error:', error);
            return;
          }

          if (device && device.name) {
            setDevices(prevDevices => ({
              ...prevDevices,
              [device.id]: {
                id: device.id,
                name: device.name,
                rssi: device.rssi,
              },
            }));
          }
        },
      );

      // Auto stop scanning after 10 seconds
      setTimeout(() => {
        if (isScanning) {
          stopScan();
        }
      }, 10000);
    } catch (error) {
      console.error('Scan error:', error);
      showToast('error', 'Scan Error', 'Failed to start scanning');
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    manager.stopDeviceScan();
    setIsScanning(false);
  };

  const connectToDevice = async (deviceId, deviceName) => {
    stopScan();
    navigation.navigate('DeviceDetails', { deviceId, deviceName });
  };

  const renderDevice = ({ item }) => (
    <TouchableOpacity
      style={styles.deviceCard}
      onPress={() => connectToDevice(item.id, item.name)}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name || 'Unnamed Device'}</Text>
        <Text style={styles.deviceId}>ID: {item.id}</Text>
        <Text style={styles.deviceRSSI}>Signal: {item.rssi} dBm</Text>
      </View>
      <View style={styles.connectButton}>
        <Text style={styles.connectButtonText}>Connect</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BLE Device Scanner</Text>
        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.scanningButton]}
          onPress={isScanning ? stopScan : startScan}
        >
          {isScanning ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.scanButtonText}>Stop Scanning</Text>
            </>
          ) : (
            <Text style={styles.scanButtonText}>Start Scan</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={Object.values(devices)}
        keyExtractor={item => item.id}
        renderItem={renderDevice}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isScanning
                ? 'Scanning for devices...'
                : 'No devices found. Tap Start Scan to search.'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  scanningButton: {
    backgroundColor: '#FF3B30',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  deviceRSSI: {
    fontSize: 12,
    color: '#999',
  },
  connectButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default BLEScanScreen;
