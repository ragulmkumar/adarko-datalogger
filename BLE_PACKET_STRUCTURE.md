<!-- typedef struct __attribute__((packed)) {
    uint16_t frame_head;          /* must equal USER_CONFIG_FRAME_HEAD on BLE write */
    char     apn[32];
    char     server_addr[64];
    uint16_t server_port;
    uint8_t  modbus_slave_id;
    uint32_t send_interval_mins;
    uint8_t  u8Vref_V;            /* supply voltage encoded: (val+200)*10 mV; refreshed on BLE connect */
    uint8_t  u8Temp_C;            /* temperature encoded: val-40 °C; refreshed on BLE connect */
    uint8_t  eui64[8];            /* populated from LL_FLASH at boot, ignored on BLE write */
    uint8_t  ble_addr[6];         /* populated from LL_FLASH at boot, ignored on BLE write */
    uint16_t fw_version;          /* populated from APP_CONFIG_FIRMWARE_VERSION at boot, ignored on BLE write */
    uint16_t hw_version;          /* populated from APP_CONFIG_HARDWARE_VERSION at boot, ignored on BLE write */
} UserConfig_t;                   /* 125 bytes */

 -->

# BLE UserConfig Packet Structure History

---

# V1 Packet Structure

```c
typedef struct __attribute__((packed)) {
    uint16_t frame_head;          /* must equal USER_CONFIG_FRAME_HEAD on BLE write */

    char     apn[32];

    char     server_addr[64];

    uint16_t server_port;

    uint8_t  modbus_slave_id;

    uint32_t send_interval_mins;

    uint8_t  eui64[8];            /* populated from LL_FLASH at boot, ignored on BLE write */

    uint8_t  ble_addr[6];         /* populated from LL_FLASH at boot, ignored on BLE write */

} UserConfig_t;
```

## Packet Size

```txt
119 Bytes
```

## Fields

| Field              | Type       | Size | Description              |
| ------------------ | ---------- | ---- | ------------------------ |
| frame_head         | uint16_t   | 2    | Packet header validation |
| apn                | char[32]   | 32   | Cellular APN             |
| server_addr        | char[64]   | 64   | Server address/domain    |
| server_port        | uint16_t   | 2    | Server port              |
| modbus_slave_id    | uint8_t    | 1    | Modbus slave ID          |
| send_interval_mins | uint32_t   | 4    | Data send interval       |
| eui64              | uint8_t[8] | 8    | Device EUI64             |
| ble_addr           | uint8_t[6] | 6    | BLE MAC address          |

---

# V2 Packet Structure

## Added Fields

- fw_version
- hw_version

```c
typedef struct __attribute__((packed)) {
    uint16_t frame_head;          /* must equal USER_CONFIG_FRAME_HEAD on BLE write */

    char     apn[32];

    char     server_addr[64];

    uint16_t server_port;

    uint8_t  modbus_slave_id;

    uint32_t send_interval_mins;

    uint8_t  eui64[8];            /* populated from LL_FLASH at boot, ignored on BLE write */

    uint8_t  ble_addr[6];         /* populated from LL_FLASH at boot, ignored on BLE write */

    uint16_t fw_version;          /* populated from APP_CONFIG_FIRMWARE_VERSION at boot, ignored on BLE write */

    uint16_t hw_version;          /* populated from APP_CONFIG_HARDWARE_VERSION at boot, ignored on BLE write */

} UserConfig_t;
```

## Packet Size

```txt
123 Bytes
```

## New Fields

| Field      | Type     | Size | Description      |
| ---------- | -------- | ---- | ---------------- |
| fw_version | uint16_t | 2    | Firmware version |
| hw_version | uint16_t | 2    | Hardware version |

---

# V3 Packet Structure (Latest)

## Added Fields

- u8Vref_V
- u8Temp_C

```c
typedef struct __attribute__((packed)) {
    uint16_t frame_head;          /* must equal USER_CONFIG_FRAME_HEAD on BLE write */

    char     apn[32];

    char     server_addr[64];

    uint16_t server_port;

    uint8_t  modbus_slave_id;

    uint32_t send_interval_mins;

    uint8_t  u8Vref_V;            /* supply voltage encoded: (val+200)*10 mV; refreshed on BLE connect */

    uint8_t  u8Temp_C;            /* temperature encoded: val-40 °C; refreshed on BLE connect */

    uint8_t  eui64[8];            /* populated from LL_FLASH at boot, ignored on BLE write */

    uint8_t  ble_addr[6];         /* populated from LL_FLASH at boot, ignored on BLE write */

    uint16_t fw_version;          /* populated from APP_CONFIG_FIRMWARE_VERSION at boot, ignored on BLE write */

    uint16_t hw_version;          /* populated from APP_CONFIG_HARDWARE_VERSION at boot, ignored on BLE write */

} UserConfig_t;
```

## Packet Size

```txt
125 Bytes
```

## New Fields

| Field    | Type    | Size | Description            |
| -------- | ------- | ---- | ---------------------- |
| u8Vref_V | uint8_t | 1    | Encoded supply voltage |
| u8Temp_C | uint8_t | 1    | Encoded temperature    |

---

# Voltage Encoding

```c
actual_voltage_mv = (u8Vref_V + 200) * 10;
```

## Example

| Raw Value | Actual Voltage |
| --------- | -------------- |
| 100       | 3000 mV        |
| 120       | 3200 mV        |
| 150       | 3500 mV        |

---

# Temperature Encoding

```c
actual_temperature_c = u8Temp_C - 40;
```

## Example

| Raw Value | Actual Temperature |
| --------- | ------------------ |
| 40        | 0°C                |
| 65        | 25°C               |
| 80        | 40°C               |

---

# Packet Evolution Summary

| Version | Size      | Added Fields           |
| ------- | --------- | ---------------------- |
| V1      | 119 Bytes | Base packet            |
| V2      | 123 Bytes | fw_version, hw_version |
| V3      | 125 Bytes | u8Vref_V, u8Temp_C     |
