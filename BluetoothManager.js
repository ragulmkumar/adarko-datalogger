import { BleManager } from 'react-native-ble-plx';

class BluetoothManager {
  constructor() {
    this.manager = null;
    this.isInitialized = false;
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

  async connectDevice(deviceId, onDisconnect) {
    if (!this.manager || !this.isInitialized) {
      this.initialize();
    }

    try {
      console.log('Connecting to device:', deviceId);
      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();

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
          console.log('Device found:', device.name, device.id);
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
