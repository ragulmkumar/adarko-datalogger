import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

export const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 31) {
      // Android 12+
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      
      return (
        result['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
        result['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
        result['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
      );
    } else {
      // Android 11 and below
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
  }
  return true;
};