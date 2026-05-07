import { BleManager } from 'react-native-ble-plx';

class BluetoothManager {
  static instance = null;

  static getInstance() {
    if (!BluetoothManager.instance) {
      BluetoothManager.instance = new BleManager();
    }
    return BluetoothManager.instance;
  }

  static destroyInstance() {
    if (BluetoothManager.instance) {
      BluetoothManager.instance.destroy();
      BluetoothManager.instance = null;
    }
  }
}

export default BluetoothManager;
