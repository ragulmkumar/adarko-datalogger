import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useBluetoothCharacteristics } from '../utils/useBluetoothCharacteristics';
import OTATab from '../Components/OTATab';
import ConfigurationTab from '../Components/ConfigurationTab';
import UserConfig from '../utils/ParseConfig';
import { showToast } from '../utils/ShowToast';

const DeviceDetailsScreen = () => {
  const route = useRoute();
  const { deviceId: routeDeviceId, deviceName: routeDeviceName } = route.params;
  const deviceId = routeDeviceId?.id ?? routeDeviceId;
  const deviceName = routeDeviceName?.name ?? routeDeviceName;
  const [activeTab, setActiveTab] = useState('configuration');
  const [configData, setConfigData] = useState([]);
  const [parsedConfig, setParsedConfig] = useState(null);

  const handleNotification = useCallback((value, type = 'ota') => {
    const timestamp = new Date();

    console.log('\n========================================');
    console.log('NOTIFICATION RECEIVED');
    console.log('Time:', timestamp.toLocaleTimeString());
    console.log('Type:', type);
    console.log('Raw value type:', typeof value);
    console.log('========================================\n');

    let bytes = null;

    // Extract bytes from different value types
    if (typeof value === 'string') {
      console.log('Processing string value (base64)');
      console.log('Base64 string length:', value.length);
      console.log('First 50 chars:', value.substring(0, 50));

      try {
        const binaryString = atob(value);
        bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        console.log('Successfully decoded base64 to bytes');
      } catch (e) {
        console.error('Base64 decode error:', e);
        return;
      }
    } else if (value instanceof Uint8Array) {
      bytes = value;
      console.log('Direct Uint8Array received, length:', bytes.length);
    } else if (value && typeof value === 'object') {
      console.log('Object structure detected');
      console.log('Object keys:', Object.keys(value));

      if (value.value && typeof value.value === 'string') {
        console.log('Found value.value property, processing as base64');
        try {
          const binaryString = atob(value.value);
          bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          console.log('Successfully decoded object.value to bytes');
        } catch (e) {
          console.error('Object value decode error:', e);
          return;
        }
      } else if (value.data && typeof value.data === 'string') {
        console.log('Found data property, processing as base64');
        try {
          const binaryString = atob(value.data);
          bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          console.log('Successfully decoded object.data to bytes');
        } catch (e) {
          console.error('Object data decode error:', e);
          return;
        }
      }
    }

    if (!bytes || bytes.length === 0) {
      console.log('ERROR: No valid bytes to process');
      return;
    }

    console.log('\n========================================');
    console.log('BYTE DATA');
    console.log('Total bytes:', bytes.length);
    console.log(
      'First 20 bytes:',
      Array.from(bytes.slice(0, 20))
        .map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0'))
        .join(', '),
    );
    if (bytes.length > 20) {
      console.log(
        'Last 20 bytes:',
        Array.from(bytes.slice(-20))
          .map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0'))
          .join(', '),
      );
    }
    console.log('========================================\n');

    const bytesToHexDisplay = bytesArray => {
      return Array.from(bytesArray)
        .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
        .join(' ');
    };

    if (type === 'config') {
      const hexDisplay = bytesToHexDisplay(bytes);

      console.log('\n========================================');
      console.log('CONFIGURATION DATA');
      console.log('Hex dump:', hexDisplay);
      console.log('========================================\n');

      setConfigData(prev => {
        const newData = [{ timestamp: new Date(), data: hexDisplay }, ...prev];
        return newData.slice(0, 50);
      });

      if (bytes.length === 119) {
        try {
          const hexString = bytesToHexDisplay(bytes).replace(/ /g, '');
          const config = UserConfig.fromHex(hexString);
          setParsedConfig(config);

          console.log('\n========================================');
          console.log('PARSED CONFIGURATION');
          console.log(
            'Frame Head: 0x' + config.frame_head.toString(16).toUpperCase(),
          );
          console.log('APN:', config.apn);
          console.log('Server Address:', config.server_addr);
          console.log('Server Port:', config.server_port);
          console.log('Modbus Slave ID:', config.modbus_slave_id);
          console.log('Send Interval:', config.send_interval_mins, 'minutes');
          console.log('EUI-64:', UserConfig.formatHexArray(config.eui64));
          console.log(
            'BLE Address:',
            UserConfig.formatHexArray(config.ble_addr),
          );
          console.log('========================================\n');

          showToast(
            'success',
            'Config Updated',
            'Configuration received from device',
          );
        } catch (parseError) {
          console.error('Parse error:', parseError);
        }
      } else {
        console.log(
          'Partial data received (',
          bytes.length,
          'bytes), waiting for full 119-byte config',
        );
      }
    } else {
      const hexDisplay = bytesToHexDisplay(bytes);
      console.log('\n========================================');
      console.log('OTA DATA');
      console.log('Hex dump:', hexDisplay);
      console.log('========================================\n');
    }
  }, []);

  const characteristics = useBluetoothCharacteristics(
    deviceId,
    handleNotification,
    activeTab,
  );

  if (!characteristics.isConnected && characteristics.device === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Connecting to device...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.deviceName}>{deviceName || 'Unknown Device'}</Text>
        <Text style={styles.deviceId}>ID: {deviceId}</Text>
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

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'configuration' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('configuration')}
        >
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

      <ScrollView style={styles.content}>
        {activeTab === 'configuration' && (
          <ConfigurationTab
            characteristics={characteristics}
            configData={configData}
            parsedConfig={parsedConfig}
          />
        )}
        {activeTab === 'ota' && <OTATab characteristics={characteristics} />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  deviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  deviceId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  connected: {
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});

export default DeviceDetailsScreen;
