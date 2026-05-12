# Device Scanning and Connection

This section explains how to discover and connect to ADARKO datalogger devices using the app's Bluetooth scanning features.

## Understanding Device Scanning

### What is Device Scanning?
Device scanning is the process of searching for nearby Bluetooth Low Energy (BLE) devices that are advertising their presence. The ADARKO Datalogger app specifically looks for compatible datalogger devices.

### How Scanning Works
- The app sends out Bluetooth signals to discover nearby devices
- Compatible devices respond with their identification information
- The app filters and displays only supported datalogger devices
- Scanning continues for up to 15 seconds or until stopped

## Starting a Device Scan

### Method 1: Using the Control Bar
1. Open the main scanning screen
2. Look for the control bar at the top
3. Tap the "Start Scanning" button
4. The button will change to "Stop Scanning" with a red color

[Screenshot Placeholder - Scan Control Bar]

### Method 2: Using the Floating Button
1. Look for the blue circular button at the bottom-right
2. Tap it to start scanning
3. The button shows a Bluetooth icon when ready
4. Shows a spinner when scanning is active

[Screenshot Placeholder - Floating Scan Button]

### Method 3: Pull to Refresh
1. On the device list area, swipe down
2. This triggers a new scan automatically
3. Works even when no devices are currently shown

## During Scanning

### Visual Indicators
- **Scanning Animation**: Spinner appears on floating button
- **Status Text**: "Scanning for devices..." message
- **Device Counter**: Updates as devices are found
- **Progress Indicator**: Shows scanning is in progress

[Screenshot Placeholder - Active Scanning Screen]

### What Happens During Scan
1. App activates Bluetooth scanning
2. Searches for BLE advertising packets
3. Filters for compatible datalogger devices
4. Displays found devices in real-time
5. Continues until timeout or manually stopped

## Understanding Device Information

When devices are found, each entry shows:

### Device Name
- The friendly name of your datalogger device
- Usually descriptive like "DL-Sensor-001"

### Device ID
- Unique Bluetooth identifier
- Shows partial address for identification
- Full ID visible on connection

### Signal Strength (RSSI)
- Measured in dBm (decibels per milliwatt)
- Higher numbers = stronger signal
- Typical range: -30 dBm (very close) to -90 dBm (far away)
- Green/strong: -50 dBm and higher
- Yellow/medium: -50 to -70 dBm
- Red/weak: -70 dBm and lower

[Screenshot Placeholder - Device List with Signal Strength]

## Connecting to a Device

### Step 1: Select Device
1. From the device list, tap on the device you want to connect to
2. The app will initiate the connection process

### Step 2: Connection Process
- Screen shows "Connecting..." status
- Bluetooth handshake occurs
- Device validation happens
- Success notification appears

[Screenshot Placeholder - Connecting to Device]

### Step 3: Successful Connection
- App navigates to Device Details screen
- Connection status shows "Connected"
- Device management tabs become available

## Connection States

### Connected
- Green indicator or "Connected" status
- Full access to device features
- Real-time communication active

### Connecting
- Temporary state during connection
- Shows progress indicator
- Cannot access device features yet

### Disconnected
- Red indicator or "Disconnected" status
- Limited or no access to device
- May attempt automatic reconnection

### Connection Failed
- Error message appears
- Returns to scanning screen
- Can retry connection

## Disconnecting from a Device

### Manual Disconnect
1. While on Device Details screen, tap the disconnect button
2. Usually located in the top-right corner
3. Confirm disconnection in the prompt

[Screenshot Placeholder - Disconnect Confirmation]

### Automatic Disconnect
- Occurs when Bluetooth is disabled
- Happens when device moves out of range
- Triggered by device power-off

## Reconnecting to Devices

### Automatic Reconnection
- App attempts to reconnect when connection is lost
- Works if device comes back in range
- No user action required

### Manual Reconnection
1. Return to scanning screen
2. Scan for devices again
3. Select the same device from the list
4. Connect as normal

## Connection Troubleshooting

### Device Not Found
**Symptoms:**
- Scan completes with no devices shown
- "No devices found" message

**Possible Causes:**
- Device is powered off
- Device is out of Bluetooth range (>10 meters)
- Device Bluetooth is disabled
- Interference from other devices

**Solutions:**
1. Check device power and Bluetooth status
2. Move closer to the device
3. Restart device if possible
4. Try scanning in a different location

### Connection Fails
**Symptoms:**
- "Connection failed" error message
- Returns to scanning screen

**Possible Causes:**
- Device is already connected to another app
- Bluetooth interference
- Device firmware issues
- Low device battery

**Solutions:**
1. Ensure no other apps are connected to the device
2. Move away from interference sources (microwaves, other Bluetooth devices)
3. Check device battery level
4. Try connecting again

### Frequent Disconnections
**Symptoms:**
- Connection drops repeatedly
- "Device disconnected" messages

**Possible Causes:**
- Unstable Bluetooth signal
- Device moving in/out of range
- Battery issues
- Environmental interference

**Solutions:**
1. Maintain stable position relative to device
2. Ensure clear line-of-sight if possible
3. Check for sources of interference
4. Replace device batteries if applicable

## Advanced Scanning Tips

### Optimal Scanning Conditions
- **Distance**: Within 5-10 meters for best results
- **Environment**: Open areas work better than crowded Bluetooth environments
- **Timing**: Scan during off-peak Bluetooth usage times
- **Positioning**: Keep devices at similar height levels

### Multiple Devices
- Scan will find all compatible devices in range
- Connect to one device at a time
- Disconnect from current device before connecting to another

### Signal Strength Guidelines
| RSSI Range | Signal Quality | Recommended Action |
|------------|----------------|-------------------|
| -30 to -50 dBm | Excellent | Good for all operations |
| -50 to -70 dBm | Good | Reliable for most operations |
| -70 to -90 dBm | Fair | May experience interruptions |
| Below -90 dBm | Poor | Move closer or check device |

## Bluetooth Requirements

### For Successful Scanning
- Bluetooth must be enabled on your phone
- Location services enabled (Android requirement)
- App permissions granted
- Device must be advertising (not in sleep mode)

### For Successful Connection
- Device must be in range and powered on
- Device must not be connected to another device/app
- Stable Bluetooth environment
- Sufficient device battery power

---

*Note: The app automatically filters for compatible ADARKO datalogger devices. If you don't see expected devices, ensure they are ADARKO branded dataloggers with BLE support.*