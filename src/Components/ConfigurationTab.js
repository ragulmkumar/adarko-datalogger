/* global btoa, Buffer */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import UserConfig from '../utils/ParseConfig';
import { showToast } from '../utils/ShowToast';

const ConfigurationTab = ({ characteristics, configData, parsedConfig }) => {
  const [apn, setApn] = useState('');
  const [serverAddr, setServerAddr] = useState('');
  const [serverPort, setServerPort] = useState('');
  const [sendIntervalMins, setSendIntervalMins] = useState('');
  const [eui64, setEui64] = useState('');
  const [isWriting, setIsWriting] = useState(false);

  useEffect(() => {
    if (!parsedConfig) {
      setApn('');
      setServerAddr('');
      setServerPort('');
      setSendIntervalMins('');
      setEui64('');
      return;
    }

    setApn(parsedConfig.apn || '');
    setServerAddr(parsedConfig.server_addr || '');
    setServerPort(parsedConfig.server_port?.toString() || '');
    setSendIntervalMins(parsedConfig.send_interval_mins?.toString() || '');
    setEui64(
      parsedConfig.eui64 ? UserConfig.formatHexArray(parsedConfig.eui64) : '',
    );
  }, [parsedConfig]);

  const bytesToBase64 = bytes => {
    if (typeof btoa !== 'undefined') {
      let binary = '';
      for (let i = 0; i < bytes.length; i += 1) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }

    if (typeof Buffer !== 'undefined') {
      return Buffer.from(bytes).toString('base64');
    }

    const chars = Array.from(bytes)
      .map(byte => String.fromCharCode(byte))
      .join('');
    return global.btoa ? global.btoa(chars) : '';
  };

  const handleWriteConfig = async () => {
    const characteristic =
      characteristics.configWriteCharacteristic ||
      characteristics.ConfigurationCharacteristic;

    if (!characteristic) {
      showToast('error', 'Error', 'Config write characteristic not available');
      return;
    }

    if (!parsedConfig) {
      showToast('info', 'Info', 'No parsed config available yet');
      return;
    }

    if (!apn.trim()) {
      showToast('error', 'Error', 'APN is required');
      return;
    }

    if (!serverAddr.trim()) {
      showToast('error', 'Error', 'Server address is required');
      return;
    }

    const port = Number(serverPort);
    if (isNaN(port) || port <= 0 || port > 65535) {
      showToast('error', 'Error', 'Valid server port (1-65535) is required');
      return;
    }

    const interval = Number(sendIntervalMins);
    if (isNaN(interval) || interval < 0) {
      showToast('error', 'Error', 'Valid send interval is required');
      return;
    }

    const config = new UserConfig();
    config.frame_head =
      parsedConfig.frame_head !== undefined ? parsedConfig.frame_head : 0xad55;
    config.apn = apn.trim();
    config.server_addr = serverAddr.trim();
    config.server_port = port;
    config.modbus_slave_id =
      parsedConfig.modbus_slave_id !== undefined
        ? parsedConfig.modbus_slave_id
        : 0;
    config.send_interval_mins = interval;
    config.eui64 = parsedConfig.eui64 || new Uint8Array(8);
    config.ble_addr = parsedConfig.ble_addr || new Uint8Array(6);

    console.log('Writing config:', {
      frame_head: `0x${config.frame_head.toString(16)}`,
      apn: config.apn,
      server_addr: config.server_addr,
      server_port: config.server_port,
      modbus_slave_id: config.modbus_slave_id,
      send_interval_mins: config.send_interval_mins,
      eui64: UserConfig.formatHexArray(config.eui64),
      ble_addr: UserConfig.formatHexArray(config.ble_addr),
    });

    const hex = config.toHex();
    const bytes = UserConfig.hexToBytes(hex);
    const base64Value = bytesToBase64(bytes);

    setIsWriting(true);
    try {
      if (characteristic.writeWithoutResponse) {
        await characteristic.writeWithoutResponse(base64Value);
        showToast('success', 'Success', 'Configuration sent to device');
      } else if (characteristic.writeWithResponse) {
        await characteristic.writeWithResponse(base64Value);
        showToast('success', 'Success', 'Configuration written to device');
      } else {
        throw new Error('No write method available on characteristic');
      }
    } catch (error) {
      console.error('Write config error:', error);
      showToast('error', 'Error', 'Failed to write configuration');
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Configuration</Text>
        <Text style={styles.sectionSubtitle}>
          EUI-64 is read-only. Edit other fields and click Write to save.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>EUI-64 (Read-Only)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={eui64}
            editable={false}
            placeholder="Waiting for config..."
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>APN</Text>
          <TextInput
            style={styles.input}
            value={apn}
            onChangeText={setApn}
            placeholder="Enter APN"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Server Address</Text>
          <TextInput
            style={styles.input}
            value={serverAddr}
            onChangeText={setServerAddr}
            placeholder="Enter server address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Server Port</Text>
          <TextInput
            style={styles.input}
            value={serverPort}
            onChangeText={setServerPort}
            placeholder="Enter server port"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Send Interval (minutes)</Text>
          <TextInput
            style={styles.input}
            value={sendIntervalMins}
            onChangeText={setSendIntervalMins}
            placeholder="Enter interval in minutes"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.writeButton,
            (!parsedConfig || isWriting) && styles.disabledButton,
          ]}
          onPress={handleWriteConfig}
          disabled={isWriting || !parsedConfig}
        >
          {isWriting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Write Configuration</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
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
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  writeButton: {
    backgroundColor: '#34C759',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ConfigurationTab;
