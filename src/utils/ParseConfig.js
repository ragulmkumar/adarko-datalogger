const USER_CONFIG_SIZE = 123; // Updated from 119 to 123 bytes

class UserConfig {
  constructor() {
    this.frame_head = 0;

    this.apn = '';
    this.server_addr = '';

    this.server_port = 0;
    this.modbus_slave_id = 0;
    this.send_interval_mins = 0;

    this.eui64 = new Uint8Array(8);
    this.ble_addr = new Uint8Array(6);
    this.fw_version = 0;
    this.hw_version = 0;
  }

  // =========================================================
  // Convert CONFIG -> HEX
  // =========================================================
  toHex() {
    const buffer = new ArrayBuffer(USER_CONFIG_SIZE);

    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    let offset = 0;

    // uint16_t frame_head
    view.setUint16(offset, this.frame_head, true);
    offset += 2;

    // char apn[32]
    UserConfig.writeCString(bytes, offset, this.apn, 32);
    offset += 32;

    // char server_addr[64]
    UserConfig.writeCString(bytes, offset, this.server_addr, 64);
    offset += 64;

    // uint16_t server_port
    view.setUint16(offset, this.server_port, true);
    offset += 2;

    // uint8_t modbus_slave_id
    view.setUint8(offset, this.modbus_slave_id);
    offset += 1;

    // uint32_t send_interval_mins
    view.setUint32(offset, this.send_interval_mins, true);
    offset += 4;

    // uint8_t eui64[8]
    bytes.set(this.eui64, offset);
    offset += 8;

    // uint8_t ble_addr[6]
    bytes.set(this.ble_addr, offset);
    offset += 6;

    // uint16_t fw_version
    view.setUint16(offset, this.fw_version, true);
    offset += 2;

    // uint16_t hw_version
    view.setUint16(offset, this.hw_version, true);
    offset += 2;

    return UserConfig.bytesToHex(bytes);
  }

  // =========================================================
  // Convert HEX -> CONFIG
  // =========================================================
  static fromHex(hexString) {
    const bytes = UserConfig.hexToBytes(hexString);

    if (bytes.length !== USER_CONFIG_SIZE) {
      throw new Error(
        `Invalid size. Expected ${USER_CONFIG_SIZE} bytes, got ${bytes.length}`,
      );
    }

    const view = new DataView(bytes.buffer);

    const cfg = new UserConfig();

    let offset = 0;

    // uint16_t frame_head
    cfg.frame_head = view.getUint16(offset, true);
    offset += 2;

    // char apn[32]
    cfg.apn = UserConfig.readCString(bytes, offset, 32);
    offset += 32;

    // char server_addr[64]
    cfg.server_addr = UserConfig.readCString(bytes, offset, 64);
    offset += 64;

    // uint16_t server_port
    cfg.server_port = view.getUint16(offset, true);
    offset += 2;

    // uint8_t modbus_slave_id
    cfg.modbus_slave_id = view.getUint8(offset);
    offset += 1;

    // uint32_t send_interval_mins
    cfg.send_interval_mins = view.getUint32(offset, true);
    offset += 4;

    // uint8_t eui64[8]
    cfg.eui64 = bytes.slice(offset, offset + 8);
    offset += 8;

    // uint8_t ble_addr[6]
    cfg.ble_addr = bytes.slice(offset, offset + 6);
    offset += 6;

    // uint16_t fw_version
    cfg.fw_version = view.getUint16(offset, true);
    offset += 2;

    // uint16_t hw_version
    cfg.hw_version = view.getUint16(offset, true);
    offset += 2;

    return cfg;
  }

  // =========================================================
  // Format version from BCD format (e.g., 0x0200 -> "02.00")
  // =========================================================
  static formatVersionBCD(version) {
    if (!version || version === 0) return '00.00';

    // Extract high and low bytes
    const highByte = (version >> 8) & 0xff;
    const lowByte = version & 0xff;

    // Convert BCD to decimal string for display
    const highPart = ((highByte >> 4) * 10 + (highByte & 0x0f))
      .toString()
      .padStart(2, '0');
    const lowPart = ((lowByte >> 4) * 10 + (lowByte & 0x0f))
      .toString()
      .padStart(2, '0');

    return `${highPart}.${lowPart}`;
  }

  // =========================================================
  // Parse version string in BCD format (e.g., "02.00" -> 0x0200)
  // =========================================================
  static parseVersionBCD(versionString) {
    if (!versionString || versionString === '00.00') return 0;

    const parts = versionString.split('.');
    if (parts.length !== 2) return 0;

    const highPart = parseInt(parts[0], 10);
    const lowPart = parseInt(parts[1], 10);

    if (isNaN(highPart) || isNaN(lowPart)) return 0;

    // Convert decimal to BCD
    const highByte = ((Math.floor(highPart / 10) << 4) | highPart % 10) & 0xff;
    const lowByte = ((Math.floor(lowPart / 10) << 4) | lowPart % 10) & 0xff;

    return (highByte << 8) | lowByte;
  }

  // =========================================================
  // Helper to get raw version hex
  // =========================================================
  static formatVersionHex(version) {
    if (!version || version === 0) return '0x0000';
    return '0x' + version.toString(16).toUpperCase().padStart(4, '0');
  }

  // =========================================================
  // Helper to format version for display (kept for backward compatibility)
  // =========================================================
  static formatVersion(version) {
    return UserConfig.formatVersionBCD(version);
  }

  // =========================================================
  // Helpers
  // =========================================================

  static writeCString(bytes, offset, str, maxLen) {
    // Clear field
    for (let i = 0; i < maxLen; i++) {
      bytes[offset + i] = 0;
    }

    const length = Math.min(str.length, maxLen - 1);
    for (let i = 0; i < length; i++) {
      bytes[offset + i] = str.charCodeAt(i);
    }
  }

  static readCString(bytes, offset, maxLen) {
    let end = offset;
    const maxEnd = offset + maxLen;

    while (end < maxEnd && bytes[end] !== 0) {
      end += 1;
    }

    const slice = bytes.slice(offset, end);
    return String.fromCharCode.apply(null, slice);
  }

  static hexToBytes(hex) {
    // Remove all whitespace and colons
    const clean = hex.replace(/\s+/g, '').replace(/:/g, '');

    if (clean.length % 2 !== 0) {
      throw new Error(`Invalid hex string length: ${clean.length}`);
    }

    const bytes = new Uint8Array(clean.length / 2);

    for (let i = 0; i < bytes.length; i++) {
      const byteStr = clean.substr(i * 2, 2);
      bytes[i] = parseInt(byteStr, 16);
    }

    return bytes;
  }

  static bytesToHex(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ');
  }

  static formatHexArray(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(':')
      .toUpperCase();
  }

  print() {
    console.log('═══════════════════════════════════════');
    console.log('📱 DEVICE CONFIGURATION');
    console.log('═══════════════════════════════════════');
    console.log(
      'frame_head         :',
      '0x' + this.frame_head.toString(16).toUpperCase(),
    );
    console.log('apn                :', this.apn);
    console.log('server_addr        :', this.server_addr);
    console.log('server_port        :', this.server_port);
    console.log('modbus_slave_id    :', this.modbus_slave_id);
    console.log('send_interval_mins :', this.send_interval_mins);
    console.log('eui64              :', UserConfig.formatHexArray(this.eui64));
    console.log(
      'ble_addr           :',
      UserConfig.formatHexArray(this.ble_addr),
    );
    console.log('───────────────────────────────────────');
    console.log(
      'fw_version         :',
      UserConfig.formatVersionHex(this.fw_version),
      `→ ${UserConfig.formatVersionBCD(this.fw_version)}`,
    );
    console.log(
      'hw_version         :',
      UserConfig.formatVersionHex(this.hw_version),
      `→ ${UserConfig.formatVersionBCD(this.hw_version)}`,
    );
    console.log('═══════════════════════════════════════');
  }

  logVersionInfo() {
    console.log('═══════════════════════════════════════');
    console.log('📱 DEVICE VERSION INFORMATION');
    console.log('═══════════════════════════════════════');
    console.log(
      `🔧 Firmware Version: ${UserConfig.formatVersionBCD(
        this.fw_version,
      )} (${UserConfig.formatVersionHex(this.fw_version)})`,
    );
    console.log(
      `🖥️  Hardware Version: ${UserConfig.formatVersionBCD(
        this.hw_version,
      )} (${UserConfig.formatVersionHex(this.hw_version)})`,
    );
    console.log(`🆔 Device EUI-64: ${UserConfig.formatHexArray(this.eui64)}`);
    console.log(`📡 BLE Address: ${UserConfig.formatHexArray(this.ble_addr)}`);
    console.log('═══════════════════════════════════════');
  }
}

export default UserConfig;
