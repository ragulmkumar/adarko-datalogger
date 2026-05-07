import { useEffect, useState } from 'react';
import BluetoothManager from '../../BluetoothManager';
import { showToast } from './ShowToast';

const OTA_SERVICE_UUID = '0000fe20-cc7a-482a-984a-7f2ed5b3e58f';
const CONFIG_SERVICE_UUID = '0000fe40-cc7a-482a-984a-7f2ed5b3e58f';


export const useBluetoothCharacteristics = (
  deviceId,
  onNotificationReceived,
  activeTab,
) => {
  const [characteristics, setCharacteristics] = useState({
    writeAddressCharacteristic: null,
    writeWithoutResponseCharacteristic: null,
    indicateCharacteristic: null,
    ConfigurationCharacteristic: null,
    LogCharacteristic: null,
    mtu: null,
    device: null,
    isConnected: false,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const manager = BluetoothManager.getInstance();
    let device = null;

    const fetchCharacteristics = async () => {
      if (isConnecting || characteristics.isConnected) {
        console.log('Already connecting or connected, skipping');
        return;
      }

      setIsConnecting(true);
      try {
        const connectId = deviceId?.id ?? deviceId;
        console.log('Connecting to device:', connectId);

        device = await manager.connectToDevice(connectId);
        console.log('Connected to device');

        // Set up disconnection listener
        device.onDisconnected(error => {
          console.log('Device disconnected:', error);
          setCharacteristics(prev => ({ ...prev, isConnected: false }));
          showToast('info', 'Disconnected', 'Device has been disconnected');
        });

        const mtu = await device.requestMTU(243);
        console.log('MTU set to:', mtu);

        await device.discoverAllServicesAndCharacteristics();
        console.log('Services discovered');

        const services = await device.services();
        console.log(
          'Services:',
          services.map(s => s.uuid),
        );

        const otaService = services.find(
          service =>
            service.uuid.toLowerCase() === OTA_SERVICE_UUID.toLowerCase(),
        );
        const configService = services.find(
          service =>
            service.uuid.toLowerCase() === CONFIG_SERVICE_UUID.toLowerCase(),
        );

        if (!otaService || !configService) {
          throw new Error('Required service(s) not found');
        }

        const otaCharacteristics = await device.characteristicsForService(
          OTA_SERVICE_UUID,
        );
        const ConfigCharacteristics = await device.characteristicsForService(
          CONFIG_SERVICE_UUID,
        );

        // Find characteristics by their properties instead of hardcoded UUIDs
        // This is more flexible as device UUIDs may vary

        // From OTA Service
        const writeAddressCharacteristic =
          otaCharacteristics.find(
            c => c.isWritableWithoutResponse && !c.isIndicatable,
          ) || otaCharacteristics[0]; // Fallback to first if not found

        const writeWithoutResponseCharacteristic = otaCharacteristics.find(
          c => c.isWritableWithoutResponse && c !== writeAddressCharacteristic,
        );

        const indicateCharacteristic = otaCharacteristics.find(
          c => c.isIndicatable,
        );

        // From CONFIG Service
        const notifiableCharacteristic = ConfigCharacteristics.find(
          c => c.isNotifiable,
        );

        const writeConfigCharacteristic = ConfigCharacteristics.find(
          c => c.isWritableWithoutResponse,
        );

        // For backwards compatibility, alias notifiable as both ConfigurationCharacteristic and LogCharacteristic
        const ConfigurationCharacteristic = writeConfigCharacteristic;
        const LogCharacteristic = notifiableCharacteristic;

        setCharacteristics({
          writeAddressCharacteristic,
          writeWithoutResponseCharacteristic,
          indicateCharacteristic,
          ConfigurationCharacteristic,
          LogCharacteristic,
          mtu,
          device,
          isConnected: true,
        });

        showToast('success', 'Connected', 'Successfully connected to device');
      } catch (error) {
        console.error('Error fetching characteristics:', error);
        showToast(
          'error',
          'Connection Error',
          error.message || 'Failed to connect to device',
        );
      } finally {
        setIsConnecting(false);
      }
    };

    fetchCharacteristics();

    return () => {
      if (device) {
        device.cancelConnection();
      }
    };
  }, [deviceId, onNotificationReceived]);

  useEffect(() => {
    const notificationSubscriptions = [];

    const parseNotificationValue = (base64Value, sourceUUID) => {
      try {
        const binaryString = atob(base64Value);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        console.log(`[${sourceUUID}] Raw bytes:`, Array.from(bytes));
        return bytes;
      } catch (error) {
        console.error('Error parsing notification value:', error);
        return null;
      }
    };

    const setupSubscription = () => {
      if (!characteristics.device || !characteristics.isConnected) {
        return;
      }

      const monitorCharacteristic =
        activeTab === 'ota'
          ? characteristics.indicateCharacteristic
          : characteristics.LogCharacteristic;

      if (!monitorCharacteristic) {
        return;
      }

      const isValidOta =
        activeTab === 'ota' && monitorCharacteristic.isIndicatable;
      const isValidConfig =
        activeTab === 'configuration' && monitorCharacteristic.isNotifiable;

      if (!isValidOta && !isValidConfig) {
        return;
      }

      const type = activeTab === 'ota' ? 'indicate' : 'config';
      const description =
        activeTab === 'ota' ? 'Indicate Characteristic' : 'Notifiable Characteristic';
      console.log(
        `Setting up monitoring for ${description}: ${monitorCharacteristic.uuid}`,
      );

      const sub = monitorCharacteristic.monitor((error, characteristic) => {
        if (error) {
          console.error(`${description} error:`, error);
          return;
        }
        if (characteristic?.value) {
          console.log(`${description} notification received`);
          const rawBytes = parseNotificationValue(
            characteristic.value,
            characteristic.uuid,
          );
          if (rawBytes && onNotificationReceived) {
            onNotificationReceived(rawBytes, type);
          }
        }
      });

      notificationSubscriptions.push(sub);
    };

    setupSubscription();

    return () => {
      notificationSubscriptions.forEach(sub => {
        if (sub && sub.remove) {
          sub.remove();
        }
      });
    };
  }, [characteristics.device, characteristics.isConnected, characteristics.indicateCharacteristic, characteristics.LogCharacteristic, activeTab, onNotificationReceived]);

  return characteristics;
};
