import { useEffect, useState, useRef } from 'react';
import BluetoothManager from '../../BluetoothManager';
import { showToast } from './ShowToast';

// UUIDs for services and characteristics
const CONFIG_SERVICE_UUID = '0000ad40-cc7a-482a-984a-7f2ed5b3e58f';
const CONFIG_WRITE_CHAR_UUID = '0000ad41-8e22-4541-9d4c-21edae82ed19';
const CONFIG_NOTIFY_CHAR_UUID = '0000ad42-8e22-4541-9d4c-21edae82ed19';

// OTA UUIDs
const OTA_SERVICE_UUID = '0000ad20-cc7a-482a-984a-7f2ed5b3e58f';
const OTA_BASE_CHAR_UUID = '0000ad22-8e22-4541-9d4c-21edae82ed19'; // Write address characteristic
const OTA_CFM_CHAR_UUID = '0000ad23-8e22-4541-9d4c-21edae82ed19'; // Indicate/Notify characteristic
const OTA_DATA_CHAR_UUID = '0000ad24-8e22-4541-9d4c-21edae82ed19'; // Write without response characteristic

export const useBluetoothCharacteristics = (
  deviceId,
  onNotificationReceived,
  activeTab,
  onConnectionChange,
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

    const setupNotifications = async (notifyChar, isOta = false) => {
      if (!notifyChar) return;

      try {
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
            onNotificationReceived(
              characteristic.value,
              isOta ? 'ota' : 'config',
            );
          }
        });

        if (isOta) {
          if (otaIndicationSubscriptionRef.current) {
            otaIndicationSubscriptionRef.current.remove();
          }
          otaIndicationSubscriptionRef.current = subscription;
          console.log('OTA indication monitoring active');
        } else {
          if (notificationSubscriptionRef.current) {
            notificationSubscriptionRef.current.remove();
          }
          notificationSubscriptionRef.current = subscription;
          console.log('Config notification monitoring active');
        }
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

        const device = await manager.connectDevice(connectId, () => {
          console.log('Device disconnected callback');
          if (isMountedRef.current) {
            setCharacteristics(prev => ({ ...prev, isConnected: false }));
            if (onConnectionChange) onConnectionChange(false);
            showToast('info', 'Disconnected', 'Device has been disconnected');
          }
          deviceRef.current = null;
        });

        deviceRef.current = device;
        console.log('Connected to device');

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

        if (!otaService) {
          console.log('[OTA] Service not found:', OTA_SERVICE_UUID);
          console.log(
            '[OTA] Available services:',
            services.map(s => s.uuid).join(', '),
          );
          console.log('[OTA] Features will be disabled on this device');
        }
        if (!configService) {
          throw new Error('Configuration Service not found');
        }

        let otaBaseCharacteristic = null;
        let otaConfirmCharacteristic = null;
        let otaDataCharacteristic = null;

        if (otaService) {
          const otaCharacteristics = await device.characteristicsForService(
            OTA_SERVICE_UUID,
          );
          console.log(
            'OTA Service characteristics:',
            otaCharacteristics.map(c => ({
              uuid: c.uuid,
              canWrite: c.isWritableWithoutResponse,
              canIndicate: c.isIndicatable,
            })),
          );

          otaBaseCharacteristic = otaCharacteristics.find(
            c => c.uuid.toLowerCase() === OTA_BASE_CHAR_UUID.toLowerCase(),
          );
          otaConfirmCharacteristic = otaCharacteristics.find(
            c => c.uuid.toLowerCase() === OTA_CFM_CHAR_UUID.toLowerCase(),
          );
          otaDataCharacteristic = otaCharacteristics.find(
            c => c.uuid.toLowerCase() === OTA_DATA_CHAR_UUID.toLowerCase(),
          );

          console.log('OTA Characteristics found:', {
            otaBaseCharacteristic: !!otaBaseCharacteristic,
            otaConfirmCharacteristic: !!otaConfirmCharacteristic,
            otaConfirmIsIndicatable:
              otaConfirmCharacteristic?.isIndicatable || false,
            otaConfirmIsNotifiable:
              otaConfirmCharacteristic?.isNotifiable || false,
            otaDataCharacteristic: !!otaDataCharacteristic,
            otaDataIsWritableWithoutResponse:
              otaDataCharacteristic?.isWritableWithoutResponse || false,
            otaDataIsWritableWithResponse:
              otaDataCharacteristic?.isWritableWithResponse || false,
          });
        }

        const configCharacteristics = await device.characteristicsForService(
          CONFIG_SERVICE_UUID,
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

        // Setup config notifications
        await setupNotifications(configNotifyCharacteristic, false);

        // Setup OTA indications if available
        if (otaConfirmCharacteristic) {
          if (
            otaConfirmCharacteristic.isIndicatable ||
            otaConfirmCharacteristic.isNotifiable
          ) {
            await setupNotifications(otaConfirmCharacteristic, true);
            console.log(
              '[OTA] Notification/Indication monitoring setup successful',
            );
          } else {
            console.log(
              '[OTA] Confirm characteristic is not indicatable or notifiable',
            );
            console.log('[OTA] Characteristic properties:', {
              isNotifiable: otaConfirmCharacteristic.isNotifiable,
              isReadable: otaConfirmCharacteristic.isReadable,
              isWritableWithResponse:
                otaConfirmCharacteristic.isWritableWithResponse,
              isWritableWithoutResponse:
                otaConfirmCharacteristic.isWritableWithoutResponse,
              isIndicatable: otaConfirmCharacteristic.isIndicatable,
            });
          }
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
          if (onConnectionChange) onConnectionChange(true);
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
          if (onConnectionChange) onConnectionChange(false);
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
      if (deviceRef.current && deviceRef.current.cancelConnection) {
        deviceRef.current.cancelConnection();
        deviceRef.current = null;
      }
    };
  }, [deviceId]);

  return characteristics;
};
