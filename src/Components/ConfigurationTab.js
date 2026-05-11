import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import UserConfig from '../utils/ParseConfig';
import { showToast } from '../utils/ShowToast';

const { height: screenHeight } = Dimensions.get('window');

const ConfigurationTab = ({
  characteristics,
  configData,
  parsedConfig,
  onWritingStateChange,
}) => {
  const [apn, setApn] = useState('');
  const [serverAddr, setServerAddr] = useState('');
  const [serverPort, setServerPort] = useState('');
  const [sendIntervalMins, setSendIntervalMins] = useState('');
  const [eui64, setEui64] = useState('');
  const [fwVersion, setFwVersion] = useState('');
  const [hwVersion, setHwVersion] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const dropdownButtonRef = useRef(null);
  const scrollViewRef = useRef(null);

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
      setFwVersion('');
      setHwVersion('');
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

    // Format firmware version - Using BCD format (02.00, 00.01, etc.)
    if (
      parsedConfig.fw_version !== undefined &&
      parsedConfig.fw_version !== 0
    ) {
      const versionBCD = UserConfig.formatVersionBCD(parsedConfig.fw_version);
      setFwVersion(versionBCD);
      console.log(
        `Firmware Version BCD: ${versionBCD} (0x${parsedConfig.fw_version
          .toString(16)
          .toUpperCase()
          .padStart(4, '0')})`,
      );
    } else {
      setFwVersion('00.00');
    }

    // Format hardware version - Using BCD format (02.00, 00.01, etc.)
    if (
      parsedConfig.hw_version !== undefined &&
      parsedConfig.hw_version !== 0
    ) {
      const versionBCD = UserConfig.formatVersionBCD(parsedConfig.hw_version);
      setHwVersion(versionBCD);
      console.log(
        `Hardware Version BCD: ${versionBCD} (0x${parsedConfig.hw_version
          .toString(16)
          .toUpperCase()
          .padStart(4, '0')})`,
      );
    } else {
      setHwVersion('00.00');
    }
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

  const measureDropdownButton = () => {
    if (dropdownButtonRef.current) {
      dropdownButtonRef.current.measure((fx, fy, width, height, px, py) => {
        const isNearBottom = py + height + 250 > screenHeight;
        setDropdownPosition({
          top: isNearBottom ? py - 250 : py + height + 4,
          left: px,
          width: width,
        });
      });
    }
  };

  const toggleDropdown = () => {
    if (!showDropdown) {
      measureDropdownButton();
    }
    setShowDropdown(!showDropdown);
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
    config.fw_version = parsedConfig.fw_version || 0; // Preserve read from device
    config.hw_version = parsedConfig.hw_version || 0; // Preserve read from device

    const hex = config.toHex();
    const bytes = UserConfig.hexToBytes(hex);
    const base64Value = bytesToBase64(bytes);

    console.log('Writing Config Payload (Base64): ', base64Value);

    setIsWriting(true);
    if (onWritingStateChange) onWritingStateChange(true);
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
      if (onWritingStateChange) onWritingStateChange(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      ref={scrollViewRef}
    >
      <View style={styles.infoCard}>
        <Icon name="settings-outline" size={24} color="#FFFFFF" />
        <Text style={styles.infoTitle}>Device Configuration</Text>
        <Text style={styles.infoText}>
          Edit the configuration parameters below and click Write to save to
          device
        </Text>
      </View>

      <View style={styles.section}>
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

        <View style={styles.infoRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>
              Firmware Version{' '}
              <Text style={styles.readOnlyBadge}>(Read-Only)</Text>
            </Text>
            <View
              style={[styles.input, styles.disabledInput, styles.versionInput]}
            >
              <Icon name="hardware-chip-outline" size={16} color="#007AFF" />
              <Text style={[styles.disabledInputText, styles.versionText]}>
                {fwVersion}
              </Text>
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>
              Hardware Version{' '}
              <Text style={styles.readOnlyBadge}>(Read-Only)</Text>
            </Text>
            <View
              style={[styles.input, styles.disabledInput, styles.versionInput]}
            >
              <Icon name="build-outline" size={16} color="#007AFF" />
              <Text style={[styles.disabledInputText, styles.versionText]}>
                {hwVersion}
              </Text>
            </View>
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
            <TouchableOpacity
              ref={dropdownButtonRef}
              style={styles.dropdownButton}
              onPress={toggleDropdown}
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

      <View style={styles.footerInfo}>
        <Icon name="information-circle-outline" size={20} color="#8E9AAB" />
        <Text style={styles.footerText}>
          Configuration will be saved to device memory
        </Text>
      </View>

      {/* Modal-based dropdown for better positioning */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View
            style={[
              styles.dropdownList,
              {
                position: 'absolute',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width || 200,
              },
            ]}
          >
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
        </TouchableOpacity>
      </Modal>
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 18,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2B4C',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  readOnlyBadge: {
    fontSize: 12,
    fontWeight: '400',
    color: '#8E9AAB',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E6EA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  versionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  versionInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E6EA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
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
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 10,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    color: '#8E9AAB',
    lineHeight: 16,
  },
});

export default ConfigurationTab;
