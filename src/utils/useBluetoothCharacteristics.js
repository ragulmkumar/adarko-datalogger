import { useEffect, useState, useRef } from 'react';
import BluetoothManager from '../../BluetoothManager';
import { showToast } from './ShowToast';

const CONFIG_SERVICE_UUID = '0000fe40-cc7a-482a-984a-7f2ed5b3e58f';
const CONFIG_WRITE_CHAR_UUID = '0000fe41-8e22-4541-9d4c-21edae82ed19';
const CONFIG_NOTIFY_CHAR_UUID = '0000fe42-8e22-4541-9d4c-21edae82ed19';

const OTA_SERVICE_UUID = '0000fe20-cc7a-482a-984a-7f2ed5b3e58f';
const OTA_BASE_CHAR_UUID = '0000fe22-cc7a-482a-984a-7f2ed5b3e58f';
const OTA_CFM_CHAR_UUID = '0000fe23-cc7a-482a-984a-7f2ed5b3e58f';
const OTA_DATA_CHAR_UUID = '0000fe24-cc7a-482a-984a-7f2ed5b3e58f';

export const useBluetoothCharacteristics = (
  deviceId,
  onNotificationReceived,
  activeTab,
) => {
  const [characteristics, setCharacteristics] = useState({
    otaBaseCharacteristic: null,
    otaConfirmCharacteristic: null,
    otaDataCharacteristic: null,
    configWriteCharacteristic: null,
    configNotifyCharacteristic: null,
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

  const isConnectingRef = useRef(false);
  const deviceRef = useRef(null);
  const notificationSubscriptionRef = useRef(null);
  const otaIndicationSubscriptionRef = useRef(null);
  const isMountedRef = useRef(true);
  const deviceIdRef = useRef(deviceId);

  useEffect(() => {
    isMountedRef.current = true;
    deviceIdRef.current = deviceId;

    const manager = BluetoothManager.getInstance();

    const setupNotifications = async notifyChar => {
      if (!notifyChar) return;

      try {
        if (notificationSubscriptionRef.current) {
          notificationSubscriptionRef.current.remove();
          notificationSubscriptionRef.current = null;
        }

        console.log('Setting up notification monitoring...');
        const subscription = notifyChar.monitor((error, characteristic) => {
          if (error) {
            console.error('Notification error:', error);
            return;
          }
          if (
            characteristic?.value &&
            onNotificationReceived &&
            isMountedRef.current
          ) {
            console.log('Notification received from device');
            onNotificationReceived(characteristic.value, 'config');
          }
        });

        notificationSubscriptionRef.current = subscription;
        console.log('Notification monitoring active');
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    const fetchCharacteristics = async () => {
      if (isConnectingRef.current || characteristics.isConnected) {
        console.log('Already connecting or connected, skipping');
        return;
      }

      isConnectingRef.current = true;
      setIsConnecting(true);

      try {
        const connectId = deviceIdRef.current?.id ?? deviceIdRef.current;
        console.log('Connecting to device:', connectId);

        const device = await manager.connectToDevice(connectId);
        deviceRef.current = device;
        console.log('Connected to device');

        device.onDisconnected(error => {
          console.log('Device disconnected:', error);
          if (isMountedRef.current) {
            setCharacteristics(prev => ({ ...prev, isConnected: false }));
            showToast('info', 'Disconnected', 'Device has been disconnected');
          }
          deviceRef.current = null;
        });

        try {
          const mtu = await device.requestMTU(240);
          console.log(
            'MTU set to:',
            typeof mtu === 'object' ? mtu.mtu || 240 : mtu,
          );
        } catch (mtuError) {
          console.log('Failed to set MTU:', mtuError);
        }

        await device.discoverAllServicesAndCharacteristics();
        console.log('Services discovered');

        const services = await device.services();
        console.log(
          'Available Services:',
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

        if (!otaService) throw new Error('OTA Service not found');
        if (!configService) throw new Error('Configuration Service not found');

        const otaCharacteristics = await device.characteristicsForService(
          OTA_SERVICE_UUID,
        );
        const configCharacteristics = await device.characteristicsForService(
          CONFIG_SERVICE_UUID,
        );

        const otaBaseCharacteristic = otaCharacteristics.find(
          c => c.uuid.toLowerCase() === OTA_BASE_CHAR_UUID.toLowerCase(),
        );
        const otaConfirmCharacteristic = otaCharacteristics.find(
          c => c.uuid.toLowerCase() === OTA_CFM_CHAR_UUID.toLowerCase(),
        );
        const otaDataCharacteristic = otaCharacteristics.find(
          c => c.uuid.toLowerCase() === OTA_DATA_CHAR_UUID.toLowerCase(),
        );
        const configWriteCharacteristic = configCharacteristics.find(
          c => c.uuid.toLowerCase() === CONFIG_WRITE_CHAR_UUID.toLowerCase(),
        );
        const configNotifyCharacteristic = configCharacteristics.find(
          c => c.uuid.toLowerCase() === CONFIG_NOTIFY_CHAR_UUID.toLowerCase(),
        );

        if (!configWriteCharacteristic)
          throw new Error('Configuration Write characteristic not found');
        if (!configNotifyCharacteristic)
          throw new Error('Configuration Notify characteristic not found');

        console.log('Config Write Characteristic found');
        console.log('Config Notify Characteristic found');

        // Setup notifications only, don't read
        await setupNotifications(configNotifyCharacteristic);

        if (
          otaConfirmCharacteristic &&
          otaConfirmCharacteristic.isIndicatable
        ) {
          if (otaIndicationSubscriptionRef.current) {
            otaIndicationSubscriptionRef.current.remove();
          }
          otaIndicationSubscriptionRef.current =
            otaConfirmCharacteristic.monitor((error, characteristic) => {
              if (error) {
                console.error('OTA error:', error);
                return;
              }
              if (
                characteristic?.value &&
                onNotificationReceived &&
                isMountedRef.current
              ) {
                console.log('OTA indication received');
                onNotificationReceived(characteristic.value, 'ota');
              }
            });
          console.log('OTA monitoring active');
        }

        const chars = {
          otaBaseCharacteristic,
          otaConfirmCharacteristic,
          otaDataCharacteristic,
          configWriteCharacteristic,
          configNotifyCharacteristic,
          writeAddressCharacteristic: otaBaseCharacteristic,
          writeWithoutResponseCharacteristic: otaDataCharacteristic,
          indicateCharacteristic: otaConfirmCharacteristic,
          ConfigurationCharacteristic: configWriteCharacteristic,
          ConfigurationCharacteristicRead: configWriteCharacteristic,
          LogCharacteristic: configNotifyCharacteristic,
          mtu: 240,
          device,
          isConnected: true,
        };

        if (isMountedRef.current) {
          setCharacteristics(chars);
        }

        showToast('success', 'Connected', 'Successfully connected to device');
        console.log('Notifications are active');
      } catch (error) {
        console.error('Error:', error);
        if (isMountedRef.current) {
          showToast(
            'error',
            'Connection Error',
            error.message || 'Failed to connect to device',
          );
        }
      } finally {
        if (isMountedRef.current) {
          setIsConnecting(false);
        }
        isConnectingRef.current = false;
      }
    };

    if (!characteristics.isConnected && !isConnectingRef.current) {
      fetchCharacteristics();
    }

    return () => {
      isMountedRef.current = false;
      if (notificationSubscriptionRef.current) {
        notificationSubscriptionRef.current.remove();
        notificationSubscriptionRef.current = null;
      }
      if (otaIndicationSubscriptionRef.current) {
        otaIndicationSubscriptionRef.current.remove();
        otaIndicationSubscriptionRef.current = null;
      }
      if (deviceRef.current) {
        deviceRef.current.cancelConnection();
        deviceRef.current = null;
      }
    };
  }, [deviceId]);

  return characteristics;
};
