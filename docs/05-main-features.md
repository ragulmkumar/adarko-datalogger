# Main Features

This section provides a comprehensive guide to all major features available in the ADARKO Datalogger app, organized by the main screens and functions.

## Device Details Screen Overview

After connecting to a device, you access the main management interface with two primary tabs:

### Configuration Tab
Access device settings and parameters

### OTA Update Tab
Perform firmware updates over-the-air

[Screenshot Placeholder - Device Details Screen Tabs]

## Configuration Tab

The Configuration tab allows you to view and modify your datalogger's operational settings.

### Accessing Configuration
1. Connect to a device
2. Ensure you're on the "Configuration" tab (default)
3. Scroll through available settings

[Screenshot Placeholder - Configuration Tab]

### Available Settings

#### Network Configuration (APN)
**Purpose:** Sets the cellular network access point for data transmission

**How to Change:**
1. Tap in the APN field
2. Enter your network provider's APN
3. Tap "Save Configuration"

**Example Values:**
- AT&T: "phone"
- Verizon: "vzwinternet"
- T-Mobile: "fast.t-mobile.com"

#### Server Address
**Purpose:** Specifies the destination server for data uploads

**How to Change:**
1. Tap the Server Address field
2. Enter the IP address or domain name
3. Tap "Save Configuration"

**Format:** 
- IP Address: "192.168.1.100"
- Domain: "data.adarko.com"

#### Server Port
**Purpose:** Defines the network port for server communication

**How to Change:**
1. Tap the Server Port field
2. Enter the port number (usually 80, 443, or custom)
3. Tap "Save Configuration"

**Common Ports:**
- HTTP: 80
- HTTPS: 443
- Custom: 8080, 9000, etc.

#### Send Interval
**Purpose:** Controls how often the device transmits data

**How to Change:**
1. Tap the Send Interval dropdown
2. Select from predefined options:
   - 1 Hour
   - 6 Hours
   - 8 Hours
   - 12 Hours
   - 24 Hours
3. The selection automatically saves

[Screenshot Placeholder - Send Interval Dropdown]

#### Device Information (Read-Only)

##### EUI64
**Purpose:** Unique 64-bit identifier for the device

**Display:** Shows as formatted hexadecimal string

**Usage:** Used for device identification and tracking

##### Firmware Version
**Purpose:** Current firmware version installed

**Display:** Format "XX.XX" (e.g., "02.15")

**Usage:** Compare with available updates

##### Hardware Version
**Purpose:** Hardware revision of the device

**Display:** Format "XX.XX" (e.g., "01.00")

**Usage:** Ensures compatibility with firmware

### Saving Configuration Changes

#### Individual Field Updates
- Most fields save automatically when changed
- Server settings require manual save

#### Bulk Save Process
1. Make all desired changes
2. Scroll to bottom of configuration screen
3. Tap "Save Configuration" button
4. Wait for success confirmation

[Screenshot Placeholder - Save Configuration Button]

#### Save Status Indicators
- **Saving...**: Shows during write operation
- **Success**: Green confirmation message
- **Error**: Red error message with details

### Configuration Best Practices

#### Network Settings
- Verify APN with your cellular provider
- Test server connectivity before deployment
- Use secure HTTPS ports when possible

#### Data Transmission
- Choose intervals based on:
  - Battery life requirements
  - Data urgency needs
  - Network costs

#### Device Identification
- Record EUI64 for device tracking
- Note firmware/hardware versions for support

## OTA Update Tab

The OTA (Over-The-Air) Update tab enables firmware updates without physical access to devices.

### Accessing OTA Updates
1. Connect to a device
2. Tap the "OTA Update" tab
3. View current firmware status

[Screenshot Placeholder - OTA Update Tab]

### Firmware Update Process

#### Step 1: Select Firmware File
1. Tap "Select Firmware File" button
2. Choose file from device storage
3. Supported formats: .bin, .hex (firmware files)

[Screenshot Placeholder - File Selection Dialog]

#### Step 2: Confirm File Selection
- App displays selected file name
- Shows file size and compatibility check
- Confirms device readiness

#### Step 3: Start Update Process
1. Tap "Start OTA Update" button
2. Confirm the update warning
3. Update begins automatically

[Screenshot Placeholder - OTA Update Confirmation]

#### Step 4: Monitor Progress
- Progress bar shows upload percentage
- Real-time status updates
- Estimated time remaining

[Screenshot Placeholder - OTA Update Progress]

### OTA Update States

#### Preparing
- Device readiness check
- File validation
- Connection stability test

#### Uploading
- File transfer to device
- Chunk-by-chunk transmission
- Progress tracking

#### Verifying
- Integrity checks
- Device response validation

#### Completing
- Final device reboot
- Connection restoration
- Success confirmation

### Update Safety Features

#### Battery Check
- Warns if device battery is low
- Recommends full charge before update

#### Connection Stability
- Monitors Bluetooth signal strength
- Warns about potential disconnections

#### Update Warnings
- Cannot close app during update
- Device may reboot
- Data transmission may pause

## Status Indicators and Messages

### Connection Status
- **Connected**: Green indicator, full functionality
- **Connecting**: Yellow, temporary state
- **Disconnected**: Red, limited functionality

### Operation Status
- **Idle**: Ready for operations
- **Writing Config**: Saving settings
- **Uploading OTA**: Firmware update in progress

### Toast Messages
- **Success**: Green, operation completed
- **Warning**: Yellow, attention needed
- **Error**: Red, operation failed

[Screenshot Placeholder - Status Messages]

## Navigation and Controls

### Tab Switching
- Swipe between Configuration and OTA tabs
- Tap tab headers to switch directly

### Back Navigation
- Use device back button
- Tap navigation back arrow
- Disconnect before leaving (recommended)

### Refresh Actions
- Pull down on configuration screen to refresh settings
- Automatic refresh after operations

## Error Handling

### Configuration Errors
- **Write Failed**: Retry save operation
- **Invalid Value**: Check field format
- **Timeout**: Check connection stability

### OTA Errors
- **File Invalid**: Select correct firmware file
- **Device Busy**: Wait and retry
- **Connection Lost**: Reconnect and restart

## Performance Considerations

### Configuration Updates
- Changes take effect after save
- Some settings require device reboot
- Network changes may need reconnection

### OTA Updates
- Large files take longer to upload
- Maintain stable Bluetooth connection
- Avoid moving device during update

## Advanced Features

### Configuration Validation
- Automatic format checking
- Range validation for numeric fields
- Network address verification

### OTA Verification
- File integrity checks
- Device compatibility validation
- Progress persistence (resumes if interrupted)

---

*Note: Always backup current configuration before making changes. OTA updates cannot be reversed once started.*