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
    console.log(`Notification received from ${type}:`, value);

    const bytesToHex = bytes =>
      Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(' ');

    if (type === 'config') {
      try {
        const decodedValue = bytesToHex(value);
        console.log('decodedValue', decodedValue);
        setConfigData(prev => [
          ...prev,
          { timestamp: new Date(), data: decodedValue },
        ]);
        try {
          const config = UserConfig.fromHex(decodedValue);
          setParsedConfig(config);
        } catch (parseError) {
          console.error('Error parsing config payload:', parseError);
        }
        showToast(
          'info',
          'Notification',
          `Config data received: ${decodedValue}`,
        );
      } catch (error) {
        console.error('Error processing config notification:', error);
      }
    } else {
      const otaValue = bytesToHex(value);
      showToast('info', 'OTA Update', `OTA notification received: ${otaValue}`);
    }
  }, []);

  const characteristics = useBluetoothCharacteristics(
    deviceId,
    handleNotification,
    activeTab,
  );

  useEffect(() => {
    if (!characteristics.isConnected) {
      // Optionally navigate back if disconnected
      // navigation.goBack();
    }
  }, [characteristics.isConnected]);

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
