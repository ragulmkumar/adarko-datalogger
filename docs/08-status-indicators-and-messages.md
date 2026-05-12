# Status Indicators and Messages

This section explains all visual indicators, status messages, and notifications you'll encounter while using the ADARKO Datalogger app.

## Connection Status Indicators

### Bluetooth Status
Located in the scanning screen header and device details.

#### Connected
- **Icon**: Green Bluetooth symbol or checkmark
- **Text**: "Connected"
- **Meaning**: Active Bluetooth connection to device
- **Actions Available**: Full device management

[Screenshot Placeholder - Connected Status]

#### Connecting
- **Icon**: Blue spinning indicator
- **Text**: "Connecting..."
- **Meaning**: Establishing Bluetooth connection
- **Actions Available**: Limited, wait for completion

#### Disconnected
- **Icon**: Red Bluetooth symbol or X mark
- **Text**: "Disconnected"
- **Meaning**: No active connection
- **Actions Available**: Return to scanning

#### Bluetooth Off
- **Icon**: Gray Bluetooth symbol with slash
- **Text**: "Bluetooth Disabled"
- **Meaning**: Phone Bluetooth is turned off
- **Actions Available**: Enable Bluetooth required

### Device Status
Shown when connected to a datalogger.

#### Ready
- **Icon**: Green circle
- **Text**: "Device Ready"
- **Meaning**: Device is operational and responsive

#### Busy
- **Icon**: Yellow spinning indicator
- **Text**: "Device Busy"
- **Meaning**: Device is processing another operation

#### Error
- **Icon**: Red triangle with exclamation
- **Text**: "Device Error"
- **Meaning**: Device encountered an issue

## Operation Status Indicators

### Configuration Operations

#### Reading Configuration
- **Icon**: Blue spinner
- **Text**: "Reading configuration..."
- **Location**: Configuration tab
- **Duration**: 2-5 seconds

#### Writing Configuration
- **Icon**: Blue spinner
- **Text**: "Saving configuration..."
- **Location**: Configuration tab
- **Duration**: 3-10 seconds

#### Configuration Saved
- **Icon**: Green checkmark
- **Text**: "Configuration saved successfully"
- **Type**: Toast notification
- **Duration**: 3 seconds

#### Save Failed
- **Icon**: Red X
- **Text**: "Failed to save configuration"
- **Type**: Toast notification
- **Duration**: 5 seconds

### OTA Update Operations

#### Preparing Update
- **Icon**: Blue spinner
- **Text**: "Preparing device for update..."
- **Location**: OTA tab
- **Duration**: 5-15 seconds

#### Uploading Firmware
- **Icon**: Progress bar (0-100%)
- **Text**: "Uploading firmware... X%"
- **Location**: OTA tab
- **Duration**: 2-15 minutes

#### Verifying Update
- **Icon**: Yellow spinner
- **Text**: "Verifying firmware update..."
- **Location**: OTA tab
- **Duration**: 10-30 seconds

#### Update Complete
- **Icon**: Green checkmark
- **Text**: "Firmware update completed successfully!"
- **Type**: Toast notification
- **Duration**: 5 seconds

#### Update Failed
- **Icon**: Red X
- **Text**: "Firmware update failed"
- **Type**: Toast notification
- **Duration**: 5 seconds

## Scanning Status Indicators

### Scanning Active
- **Icon**: Spinning Bluetooth icon on floating button
- **Text**: "Scanning for devices..."
- **Location**: Main scanning screen
- **Duration**: Up to 15 seconds

### Scanning Complete
- **Icon**: Static Bluetooth icon
- **Text**: "Scan complete"
- **Type**: Status text change
- **Duration**: Until next scan

### No Devices Found
- **Icon**: Bluetooth icon with question mark
- **Text**: "No devices found nearby"
- **Location**: Empty state screen
- **Suggestion**: "Try moving closer or check device power"

### Devices Found
- **Icon**: List with device count
- **Text**: "X Devices Found"
- **Location**: Control bar
- **Updates**: Real-time as devices discovered

## Signal Strength Indicators

### RSSI (Received Signal Strength Indicator)
Displayed for each discovered device.

#### Excellent Signal
- **Range**: -30 to -50 dBm
- **Icon**: Full signal bars (green)
- **Recommendation**: Optimal for all operations

#### Good Signal
- **Range**: -50 to -70 dBm
- **Icon**: 3 signal bars (green)
- **Recommendation**: Good for most operations

#### Fair Signal
- **Range**: -70 to -90 dBm
- **Icon**: 2 signal bars (yellow)
- **Recommendation**: May experience interruptions

#### Poor Signal
- **Range**: Below -90 dBm
- **Icon**: 1 signal bar (red)
- **Recommendation**: Unreliable, move closer

#### No Signal
- **Range**: Not detectable
- **Icon**: No bars (gray)
- **Recommendation**: Device out of range

## Toast Notifications

Toast messages appear at the bottom of the screen for 3-5 seconds.

### Success Messages
- **Green background**
- **Checkmark icon**
- **Examples**:
  - "Connected to device successfully"
  - "Configuration saved successfully"
  - "Firmware update completed successfully"

### Warning Messages
- **Yellow/Orange background**
- **Exclamation triangle icon**
- **Examples**:
  - "Weak Bluetooth signal detected"
  - "Device battery low"
  - "Update may take several minutes"

### Error Messages
- **Red background**
- **X mark icon**
- **Examples**:
  - "Failed to connect to device"
  - "Configuration save failed"
  - "Firmware file not compatible"

## Modal Dialogs

### Bluetooth Disabled Modal
- **Trigger**: Bluetooth turned off while app is open
- **Title**: "Bluetooth Required"
- **Message**: "Bluetooth must be enabled to use this app"
- **Buttons**: "Enable Bluetooth" / "Cancel"

[Screenshot Placeholder - Bluetooth Disabled Modal]

### Disconnect Confirmation
- **Trigger**: Tapping disconnect button
- **Title**: "Disconnect Device"
- **Message**: "Are you sure you want to disconnect from [Device Name]?"
- **Buttons**: "Disconnect" / "Cancel"

### OTA Update Warning
- **Trigger**: Starting firmware update
- **Title**: "Critical Update Warning"
- **Message**: Detailed warning about update process
- **Buttons**: "Start Update" / "Cancel"

### Permission Request
- **Trigger**: First app use or permission revoked
- **Title**: "Permission Required"
- **Message**: Specific permission explanation
- **Buttons**: "Grant" / "Deny"

## Loading States

### App Initialization
- **Screen**: Loading screen on app start
- **Indicator**: Large spinner
- **Text**: "Initializing Bluetooth..."
- **Duration**: 5-15 seconds

### Device Connection
- **Screen**: Device details screen
- **Indicator**: Inline spinner
- **Text**: "Connecting to device..."
- **Duration**: 2-5 seconds

### Configuration Loading
- **Screen**: Configuration tab
- **Indicator**: Small spinner in each field
- **Text**: "Loading..."
- **Duration**: 1-3 seconds

## Error States

### Connection Error
- **Icon**: Red exclamation
- **Text**: "Connection failed"
- **Suggestion**: "Check device power and try again"

### Permission Denied
- **Icon**: Red lock
- **Text**: "Permission required"
- **Suggestion**: "Grant permission in app settings"

### File Error
- **Icon**: Red file icon
- **Text**: "File not accessible"
- **Suggestion**: "Check file location and permissions"

## Progress Indicators

### OTA Upload Progress
- **Type**: Circular progress bar
- **Range**: 0-100%
- **Updates**: Real-time percentage
- **Time Estimate**: Shows remaining time

### Configuration Save Progress
- **Type**: Linear progress bar
- **Range**: 0-100%
- **Updates**: Step-based progress

## Status Colors

### Color Coding System
- **Green (#4CAF50)**: Success, connected, ready
- **Blue (#2196F3)**: In progress, information
- **Yellow/Orange (#FF9800)**: Warning, attention needed
- **Red (#F44336)**: Error, problem
- **Gray (#9E9E9E)**: Disabled, inactive

### Consistent Usage
- **Green**: Positive states (connected, success)
- **Blue**: Active operations (scanning, connecting)
- **Yellow**: Caution states (weak signal, low battery)
- **Red**: Error states (failed, disconnected)
- **Gray**: Inactive states (Bluetooth off, no devices)

## Accessibility Features

### Screen Reader Support
- All status indicators have descriptive text
- Toast messages are announced
- Modal dialogs have proper labels

### High Contrast Mode
- Status colors maintain visibility
- Icons remain clear in high contrast

### Large Text Support
- Status text scales with system font size
- Progress indicators remain readable

## Troubleshooting Status Issues

### Inconsistent Status Display
**Problem:** Status doesn't match actual state
**Solution**: 
1. Refresh the screen (pull down)
2. Restart Bluetooth connection
3. Close and reopen app

### Missing Status Updates
**Problem:** Status doesn't change when it should
**Solution**:
1. Check Bluetooth connection
2. Verify device responsiveness
3. Restart the device

### Conflicting Status Messages
**Problem:** Multiple status messages showing
**Solution**:
1. Wait for current operation to complete
2. Disconnect and reconnect
3. Close background operations

---

*Note: Status indicators provide real-time feedback about app and device state. If statuses seem incorrect, try refreshing or restarting the connection.*