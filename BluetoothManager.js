import { BleManager } from 'react-native-ble-plx';
import { Linking, Platform, NativeModules } from 'react-native';

class BluetoothManager {
  constructor() {
    this.manager = null;
    this.isInitialized = false;
    this.stateChangeListener = null;
  }

  static instance = null;

  static getInstance() {
    if (!BluetoothManager.instance) {
      BluetoothManager.instance = new BluetoothManager();
      BluetoothManager.instance.initialize();
    }
    return BluetoothManager.instance;
  }

  initialize() {
    if (!this.manager) {
      this.manager = new BleManager();
      this.isInitialized = true;
      console.log('BluetoothManager initialized successfully');
    }
  }

  static destroyInstance() {
    if (BluetoothManager.instance) {
      if (BluetoothManager.instance.manager) {
        BluetoothManager.instance.manager.destroy();
      }
      BluetoothManager.instance = null;
    }
  }

  async getBluetoothState() {
    if (!this.manager || !this.isInitialized) {
      this.initialize();
    }

    try {
      const state = await this.manager.state();
      console.log('Current Bluetooth state:', state);
      return state;
    } catch (error) {
      console.error('Error getting Bluetooth state:', error);
      return 'Unknown';
    }
  }

  monitorBluetoothState(callback) {
    if (!this.manager || !this.isInitialized) {
      this.initialize();
    }

    if (!this.manager) {
      console.error('BluetoothManager not initialized');
      return;
    }

    console.log('Monitoring Bluetooth state changes...');
    this.stateChangeListener = this.manager.onStateChange(state => {
      console.log('Bluetooth state changed to:', state);
      if (callback) callback(state);
    }, true);
  }

  stopMonitoringBluetoothState() {
    if (this.stateChangeListener) {
      this.stateChangeListener.remove();
      this.stateChangeListener = null;
      console.log('Stopped monitoring Bluetooth state');
    }
  }

  async openBluetoothSettings() {
    try {
      if (Platform.OS === 'android') {
        // Android: Try using native module first (most reliable)
        try {
          if (NativeModules.BluetoothModule?.openSettings) {
            await NativeModules.BluetoothModule.openSettings();
            return;
          }
        } catch (nativeError) {
          console.log('Native module not available, using Linking fallbacks');
        }

        // Fallback 1: Try android-settings scheme
        try {
          console.log('Attempt 1: Opening with android-settings scheme...');
          await Linking.openURL('android-settings://Bluetooth');
          return;
        } catch (error1) {
          console.error('Attempt 1 failed:', error1);
        }

        // Fallback 2: Try Settings app via component name
        try {
          console.log('Attempt 2: Opening Settings app Bluetooth activity...');
          const intentUrl =
            'intent://action/android.settings.BLUETOOTH_SETTINGS#Intent;scheme=;end';
          await Linking.openURL(intentUrl);
          return;
        } catch (error2) {
          console.error('Attempt 2 failed:', error2);
        }

        // Fallback 3: Try generic Settings app
        try {
          console.log('Attempt 3: Opening generic Settings app...');
          const intentUrl =
            'intent://action/android.intent.action.MAIN?component=com.android.settings/.Settings#Intent;scheme=;end';
          await Linking.openURL(intentUrl);
          return;
        } catch (error3) {
          console.error('Attempt 3 failed:', error3);
          throw new Error(
            'Could not open Bluetooth settings. Please enable Bluetooth manually through your device settings.',
          );
        }
      } else if (Platform.OS === 'ios') {
        // iOS: Open Settings app (iOS doesn't allow direct Bluetooth toggle)
        await Linking.openURL('app-settings:');
      }
    } catch (error) {
      console.error('Error opening Bluetooth settings:', error);
      throw error;
    }
  }

  async connectDevice(deviceId, onDisconnect) {
    if (!this.manager || !this.isInitialized) {
      this.initialize();
    }

    try {
      console.log('Connecting to device:', deviceId);
      const device = await this.manager.connectToDevice(deviceId, {
        autoConnect: false,
      });

      device.onDisconnected(error => {
        console.log('Device disconnected:', deviceId, error);
        if (onDisconnect) onDisconnect(error);
      });

      return device;
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  async disconnectDevice(deviceId) {
    if (!this.manager || !this.isInitialized) {
      return;
    }

    try {
      const device = await this.manager.device(deviceId);
      if (device) {
        await device.cancelConnection();
        console.log('Device disconnected successfully');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  startScan(onDeviceFound, onError) {
    if (!this.manager || !this.isInitialized) {
      console.error('BluetoothManager not initialized, initializing now...');
      this.initialize();
    }

    if (!this.manager) {
      if (onError) onError(new Error('BluetoothManager not initialized'));
      return;
    }

    console.log('Starting BLE scan...');

    this.manager.startDeviceScan(
      null,
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          if (onError) onError(error);
          return;
        }
        if (device && device.name) {
          onDeviceFound(device);
        }
      },
    );
  }

  stopScan() {
    if (!this.manager || !this.isInitialized) {
      return;
    }

    console.log('Stopping BLE scan...');
    this.manager.stopDeviceScan();
  }

  getManager() {
    if (!this.manager || !this.isInitialized) {
      this.initialize();
    }
    return this.manager;
  }
}

export default BluetoothManager;
