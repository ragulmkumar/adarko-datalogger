# Settings and Configurations

This section explains all available settings and configuration options in the ADARKO Datalogger app, including default behaviors and recommended configurations.

## App-Level Settings

The ADARKO Datalogger app has minimal app-level settings, focusing on device management rather than app configuration.

### Permission Settings
Most settings are managed through Android system permissions:

#### Bluetooth Permissions
- **Access**: Settings > Apps > ADARKO Datalogger > Permissions
- **Required**: Bluetooth scan, connect, location
- **Purpose**: Enable device discovery and connection

#### Storage Permissions
- **Access**: Settings > Apps > ADARKO Datalogger > Permissions
- **Required**: File access for firmware updates
- **Purpose**: Select and read firmware files

### App Information
- **Version**: Current app version
- **Storage**: App data usage
- **Cache**: Temporary file storage

## Device Configuration Settings

Device settings are accessed through the Configuration tab when connected to a datalogger.

### Network Configuration

#### APN (Access Point Name)
**Purpose:** Defines the cellular network gateway for data transmission

**Default:** None (must be configured)

**Recommended Settings by Carrier:**
| Carrier | APN | Username | Password |
|---------|-----|----------|----------|
| AT&T | phone | (blank) | (blank) |
| Verizon | vzwinternet | (blank) | (blank) |
| T-Mobile | fast.t-mobile.com | (blank) | (blank) |
| Vodafone | live.vodafone.com | (blank) | (blank) |

**How to Set:**
1. Tap APN field
2. Enter carrier APN
3. Save configuration

#### Server Address
**Purpose:** Destination for data uploads

**Default:** None (must be configured)

**Format Options:**
- IP Address: `192.168.1.100`
- Domain Name: `data.adarko.com`
- Subdomain: `api.adarko.com`

**Recommended:** Use HTTPS domains for security

#### Server Port
**Purpose:** Network port for server communication

**Default:** None (must be configured)

**Common Ports:**
- HTTP: `80`
- HTTPS: `443`
- Custom API: `8080`, `8443`

**Security Note:** Prefer secure ports (443) when possible

### Data Transmission Settings

#### Send Interval
**Purpose:** Frequency of data transmission to server

**Available Options:**
- 1 Hour
- 6 Hours
- 8 Hours
- 12 Hours
- 24 Hours

**Default:** 8 Hours (recommended for most applications)

**Selection Criteria:**

| Use Case | Recommended Interval | Reasoning |
|----------|---------------------|-----------|
| Real-time monitoring | 1 Hour | Critical data needs |
| Regular updates | 6-8 Hours | Balance battery/data |
| Periodic checks | 12-24 Hours | Power conservation |
| Event-based | Custom | Triggered transmission |

**Battery Impact:**
- Shorter intervals = More frequent transmissions = Higher battery usage
- Longer intervals = Less frequent transmissions = Better battery life

### Device Information (Read-Only)

#### EUI64 (Extended Unique Identifier)
**Purpose:** Unique 64-bit device identifier

**Format:** 16-character hexadecimal string (e.g., `0011223344556677`)

**Usage:**
- Device tracking and identification
- Support ticket reference
- Asset management

#### Firmware Version
**Purpose:** Current firmware version

**Format:** XX.XX (e.g., `02.15`)

**How to Read:**
- Major version: First two digits
- Minor version: Last two digits

**Update Check:** Compare with available OTA updates

#### Hardware Version
**Purpose:** Hardware revision identifier

**Format:** XX.XX (e.g., `01.00`)

**Usage:**
- Compatibility verification
- Feature support checking
- Warranty information

## Default Configuration Profiles

### Pre-configured Profiles

#### Standard Monitoring Profile
```
APN: [Carrier-specific]
Server: data.adarko.com
Port: 443
Interval: 8 Hours
```
**Use Case:** General environmental monitoring

#### High-Frequency Profile
```
APN: [Carrier-specific]
Server: api.adarko.com
Port: 443
Interval: 1 Hour
```
**Use Case:** Critical infrastructure monitoring

#### Low-Power Profile
```
APN: [Carrier-specific]
Server: data.adarko.com
Port: 443
Interval: 24 Hours
```
**Use Case:** Remote locations, solar power

## Configuration Management

### Saving Changes
1. **Automatic Save**: Some fields save immediately
2. **Manual Save**: Tap "Save Configuration" for network settings
3. **Batch Updates**: Make multiple changes before saving

### Validation Rules
- **APN**: Text field, no specific format
- **Server Address**: Valid IP or domain name
- **Port**: Numeric, 1-65535
- **Interval**: Predefined options only

### Error Handling
- **Invalid Format**: Red error message
- **Save Failed**: Retry with connection check
- **Timeout**: Check Bluetooth stability

## Advanced Configuration Options

### Custom Server Configurations

#### Load Balancing
- Use domain names that resolve to multiple IPs
- Example: `api.adarko.com` (points to server farm)

#### Secure Connections
- Always use port 443 for HTTPS
- Verify SSL certificates if custom server

#### Backup Servers
- Configure secondary server for redundancy
- Automatic failover if primary unavailable

### Transmission Optimization

#### Data Compression
- Firmware may support data compression
- Reduces transmission size and cost

#### Adaptive Intervals
- Some firmware versions support dynamic intervals
- Adjust based on battery level or signal strength

## Configuration Backup and Restore

### Manual Backup
1. **Record Settings**: Note all configuration values
2. **Screenshot**: Capture configuration screen
3. **Document**: Save in secure location

### Restore Process
1. **Reconnect Device**: Access configuration tab
2. **Enter Values**: Manually re-enter settings
3. **Save**: Apply configuration
4. **Verify**: Test device operation

## Troubleshooting Configuration Issues

### Common Problems

#### Settings Not Saving
**Symptoms:** Changes disappear after app restart

**Causes:**
- Save operation failed
- Device disconnected during save
- Configuration write error

**Solutions:**
1. Ensure stable Bluetooth connection
2. Retry save operation
3. Check device battery level

#### Invalid Server Settings
**Symptoms:** Data transmission fails

**Causes:**
- Wrong server address
- Incorrect port
- Network connectivity issues

**Solutions:**
1. Verify server details with administrator
2. Test network connectivity
3. Check firewall settings

#### Device Not Responding to Changes
**Symptoms:** Configuration shows saved but device behaves differently

**Causes:**
- Device reboot required
- Firmware incompatibility
- Hardware issues

**Solutions:**
1. Power cycle device
2. Check firmware version compatibility
3. Contact technical support

## Best Practices

### Configuration Planning
- **Document Changes**: Record all modifications
- **Test Settings**: Verify after configuration
- **Backup First**: Save current settings before changes

### Security Considerations
- **Secure Servers**: Use HTTPS whenever possible
- **Access Control**: Limit server access to authorized devices
- **Data Encryption**: Ensure end-to-end encryption

### Performance Optimization
- **Balance Intervals**: Match data needs with battery life
- **Monitor Usage**: Track data transmission patterns
- **Regular Review**: Update settings based on usage patterns

## Configuration Templates

### Environmental Monitoring Setup
```
APN: fast.t-mobile.com
Server: env-monitor.adarko.com
Port: 443
Interval: 6 Hours
Purpose: Regular environmental data collection
```

### Asset Tracking Setup
```
APN: vzwinternet
Server: tracking.adarko.com
Port: 443
Interval: 1 Hour
Purpose: Real-time asset location monitoring
```

### Maintenance Monitoring Setup
```
APN: live.vodafone.com
Server: maintenance.adarko.com
Port: 443
Interval: 12 Hours
Purpose: Equipment health monitoring
```

## Support and Documentation

### Getting Help
- **Configuration Guide**: Refer to device manual
- **Network Setup**: Contact carrier for APN details
- **Server Configuration**: Consult IT administrator

### Documentation Resources
- **Device Manual**: Hardware-specific settings
- **API Documentation**: Server integration details
- **Firmware Release Notes**: New configuration options

---

*Note: Configuration settings affect device behavior and data transmission. Always test changes in a controlled environment before deployment.*