# Getting Started

This section walks you through your first use of the ADARKO Datalogger app, from opening the app to connecting your first device.

## First App Launch

### Step 1: Open the App
1. Locate the ADARKO Datalogger icon on your home screen
2. Tap the icon to launch the app
3. The app will display a loading screen while initializing

[Screenshot Placeholder - App Launch Screen]

### Step 2: Permission Setup
When you first open the app, you'll be prompted to grant necessary permissions:

#### Bluetooth Permissions (Android)
```
"ADARKO Datalogger" would like to access Bluetooth
```
- Tap "Allow" to enable Bluetooth scanning and connection

#### Location Permission (Android)
```
"ADARKO Datalogger" would like to access your location
```
- This permission is required for Bluetooth Low Energy scanning
- Select "While using the app" or "Allow all the time"
- This permission is used only for BLE discovery and doesn't track your location

[Screenshot Placeholder - Permission Request Screen]

### Step 3: Bluetooth Initialization
- The app will check your Bluetooth status
- If Bluetooth is disabled, you'll see a prompt to enable it

#### Enable Bluetooth
1. Tap "Enable Bluetooth" in the app prompt
2. Or go to your device Settings > Bluetooth and turn it on
3. Return to the app

[Screenshot Placeholder - Bluetooth Enable Prompt]

## Understanding the Main Screen

After setup, you'll see the main device scanning screen:

### Screen Elements
- **Header**: Shows "ADARKO Datalogger" title
- **Device Counter**: Displays number of devices found (starts at 0)
- **Scan Controls**: Start/Stop scanning buttons
- **Device List**: Shows discovered devices (empty initially)
- **Floating Action Button**: Quick access to start scanning

[Screenshot Placeholder - Main Scanning Screen]

### Status Indicators
- **Bluetooth Status**: Shows if Bluetooth is ready
- **Scanning Status**: Indicates when actively scanning
- **Device Count**: Updates as devices are found

## Your First Device Scan

### Step 1: Prepare Your Device
1. Ensure your datalogger device is powered on
2. Make sure it's in Bluetooth advertising mode
3. Position your phone within 10 meters (33 feet) of the device

### Step 2: Start Scanning
1. Tap the "Start Scanning" button in the control bar
2. Or tap the floating Bluetooth button at the bottom
3. The app will begin searching for nearby devices

[Screenshot Placeholder - Scanning in Progress]

### Step 3: Wait for Results
- Scanning typically takes 10-15 seconds
- The device counter will update as devices are found
- Compatible devices will appear in the list

### Step 4: Identify Your Device
When devices are found, each will show:
- **Device Name**: The name of your datalogger
- **Device ID**: Unique identifier (partial display)
- **Signal Strength**: RSSI value in dBm (higher numbers = stronger signal)

[Screenshot Placeholder - Device List with Found Devices]

## Connecting to Your First Device

### Step 1: Select a Device
1. Tap on a device from the list
2. The app will attempt to connect

### Step 2: Connection Process
- You'll see a connecting indicator
- Connection typically takes 2-5 seconds
- Success message appears when connected

[Screenshot Placeholder - Device Connection in Progress]

### Step 3: Device Details Screen
Once connected, you'll enter the device management screen with two main tabs:
- **Configuration**: View and edit device settings
- **OTA Update**: Perform firmware updates

[Screenshot Placeholder - Device Details Screen]

## Initial Device Check

### View Current Configuration
1. Stay on the "Configuration" tab (default)
2. Review the current device settings:
   - APN (network settings)
   - Server address and port
   - Send interval
   - Device identifiers

### Check Firmware Version
- Look at the Firmware Version field
- Note the current version for future updates

## Disconnecting

When you're done:
1. Tap the disconnect button (usually in the top-right)
2. Confirm disconnection
3. Return to the scanning screen

## What to Do Next

Now that you've connected your first device:

1. **Explore Configuration**: Try viewing and understanding the device settings
2. **Learn About Updates**: Read the OTA Update section to understand firmware management
3. **Practice Scanning**: Try scanning again to reconnect to the same or different devices

## Tips for Success

- **Keep Devices Close**: Best results within 5-10 meters
- **Stable Environment**: Avoid interference from other Bluetooth devices
- **Fresh Batteries**: Ensure datalogger devices have adequate power
- **One at a Time**: Connect to one device at a time for best performance

## Common First-Time Issues

### No Devices Found
- Check that your datalogger is powered on and advertising
- Move closer to the device
- Ensure no other apps are using Bluetooth

### Connection Fails
- Try again - sometimes initial connections need a retry
- Check device battery level
- Ensure device isn't connected to another app

### Permissions Still Denied
- Go to device Settings > Apps > ADARKO Datalogger > Permissions
- Manually enable Bluetooth and Location permissions

---

*Note: The app remembers your permission settings for future use. You should only need to grant permissions once.*