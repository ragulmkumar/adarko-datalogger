import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import UserConfig from '../utils/ParseConfig';
import { showToast } from '../utils/ShowToast';

const ConfigurationTab = ({ characteristics, configData, parsedConfig }) => {
  const [apn, setApn] = useState('');
  const [serverAddr, setServerAddr] = useState('');
  const [serverPort, setServerPort] = useState('');
  const [sendIntervalMins, setSendIntervalMins] = useState('');
  const [eui64, setEui64] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Dropdown options: value in hours, label for display
  const intervalOptions = [
    { label: '1 Hour', value: 1, minutes: 60 },
    { label: '6 Hours', value: 6, minutes: 360 },
    { label: '8 Hours', value: 8, minutes: 480 },
    { label: '12 Hours', value: 12, minutes: 720 },
    { label: '24 Hours', value: 24, minutes: 1440 },
  ];

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

    // Convert minutes to hours for display
    const mins = parsedConfig.send_interval_mins;
    const option = intervalOptions.find(opt => opt.minutes === mins);
    if (option) {
      setSendIntervalMins(option.label);
    } else {
      setSendIntervalMins('');
    }

    setEui64(
      parsedConfig.eui64 ? UserConfig.formatHexArray(parsedConfig.eui64) : '',
    );
  }, [parsedConfig]);

  const bytesToBase64 = bytes => {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const handleSelectInterval = option => {
    setSendIntervalMins(option.label);
    setShowDropdown(false);
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
      showToast('info', 'Info', 'Waiting for configuration from device...');
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

    // Get minutes from selected option
    const selectedOption = intervalOptions.find(
      opt => opt.label === sendIntervalMins,
    );
    if (!selectedOption) {
      showToast('error', 'Error', 'Please select a valid send interval');
      return;
    }

    const interval = selectedOption.minutes;

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

    const hex = config.toHex();
    const bytes = UserConfig.hexToBytes(hex);
    const base64Value = bytesToBase64(bytes);

    console.log('Writing Config Payload (Base64): ', base64Value);

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
      showToast('error', 'Error', 'Failed to write configuration');
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Configuration</Text>
        <Text style={styles.sectionSubtitle}>
          Edit the configuration parameters below and click Write to save to
          device
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            EUI-64 <Text style={styles.readOnlyBadge}>(Read-Only)</Text>
          </Text>
          <View style={[styles.input, styles.disabledInput]}>
            <Text style={styles.disabledInputText}>
              {eui64 || 'Waiting for config...'}
            </Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>APN</Text>
          <TextInput
            style={styles.input}
            value={apn}
            onChangeText={setApn}
            placeholder="e.g., internet.com"
            placeholderTextColor="#C0C8D2"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Server Address</Text>
          <TextInput
            style={styles.input}
            value={serverAddr}
            onChangeText={setServerAddr}
            placeholder="Enter server address"
            placeholderTextColor="#C0C8D2"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Server Port</Text>
            <TextInput
              style={styles.input}
              value={serverPort}
              onChangeText={setServerPort}
              placeholder="Port"
              placeholderTextColor="#C0C8D2"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Send Interval</Text>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowDropdown(!showDropdown)}
                activeOpacity={0.7}
              >
                <Text
                  style={
                    sendIntervalMins
                      ? styles.dropdownText
                      : styles.placeholderText
                  }
                >
                  {sendIntervalMins || 'Select interval'}
                </Text>
                <Icon
                  name={showDropdown ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#8E9AAB"
                />
              </TouchableOpacity>

              {showDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    style={styles.dropdownScroll}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    {intervalOptions.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dropdownItem,
                          sendIntervalMins === option.label &&
                            styles.selectedDropdownItem,
                          index === intervalOptions.length - 1 &&
                            styles.lastDropdownItem,
                        ]}
                        onPress={() => handleSelectInterval(option)}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            sendIntervalMins === option.label &&
                              styles.selectedDropdownItemText,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {sendIntervalMins === option.label && (
                          <Icon name="checkmark" size={16} color="#007AFF" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.writeButton,
            (!parsedConfig || isWriting) && styles.disabledButton,
          ]}
          onPress={handleWriteConfig}
          disabled={isWriting || !parsedConfig}
          activeOpacity={0.8}
        >
          {isWriting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Icon name="save-outline" size={18} color="#FFFFFF" />
              <Text style={styles.writeButtonText}>Write Configuration</Text>
            </>
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
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A2B4C',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#8E9AAB',
    marginBottom: 18,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A2B4C',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  readOnlyBadge: {
    fontSize: 11,
    fontWeight: '400',
    color: '#8E9AAB',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E6EA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A2B4C',
    backgroundColor: '#FFFFFF',
  },
  disabledInput: {
    backgroundColor: '#F8F9FC',
    borderColor: '#E2E6EA',
  },
  disabledInputText: {
    fontSize: 14,
    color: '#8E9AAB',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 100,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E6EA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 14,
    color: '#1A2B4C',
  },
  placeholderText: {
    fontSize: 14,
    color: '#C0C8D2',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E6EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    maxHeight: 250,
  },
  dropdownScroll: {
    maxHeight: 250,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  lastDropdownItem: {
    borderBottomWidth: 0,
  },
  selectedDropdownItem: {
    backgroundColor: '#F5F9FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#1A2B4C',
  },
  selectedDropdownItemText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#C8D0DC',
  },
  writeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ConfigurationTab;
