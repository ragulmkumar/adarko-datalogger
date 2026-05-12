# Troubleshooting

This section provides solutions to common problems you may encounter while using the ADARKO Datalogger app. Each issue includes symptoms, possible causes, and step-by-step solutions.

## Device Discovery Issues

### Problem: No Devices Found During Scan

**Symptoms:**
- Scan completes with "No devices found"
- Device list remains empty
- Scanning animation runs for full 15 seconds

**Possible Causes:**
1. Device is powered off
2. Device is out of Bluetooth range (>10 meters)
3. Device Bluetooth is disabled
4. Interference from other Bluetooth devices
5. Device is already connected to another app

**Step-by-Step Solutions:**

#### Solution 1: Check Device Power and Status
1. Verify the datalogger device is powered on
2. Check device LED indicators (if available)
3. Ensure device has sufficient battery power
4. Try power cycling the device (off/on)

#### Solution 2: Check Bluetooth Range
1. Move closer to the device (within 5 meters)
2. Remove physical obstacles between phone and device
3. Avoid areas with high Bluetooth interference:
   - Near microwaves
   - Close to other Bluetooth devices
   - In crowded wireless environments

#### Solution 3: Verify Device Bluetooth Status
1. Check if device has a Bluetooth pairing mode
2. Consult device manual for advertising instructions
3. Ensure device firmware supports Bluetooth advertising

#### Solution 4: Clear Bluetooth Interference
1. Turn off other Bluetooth devices temporarily
2. Move to a different location
3. Restart phone Bluetooth:
   - Settings > Bluetooth > Turn off
   - Wait 10 seconds
   - Turn back on

#### Solution 5: Check for Existing Connections
1. Ensure no other apps are connected to the device
2. Check if device is paired with another phone/tablet
3. Unpair device from other devices if necessary

### Problem: Device Appears and Disappears

**Symptoms:**
- Device shows up in scan, then disappears
- Inconsistent device detection
- Device list changes during scanning

**Possible Causes:**
1. Unstable Bluetooth connection
2. Low device battery
3. Device entering sleep mode
4. Signal interference

**Solutions:**
1. Replace device batteries
2. Move to area with better signal
3. Keep device stationary during scanning
4. Update device firmware if available

## Connection Problems

### Problem: Connection Fails Immediately

**Symptoms:**
- "Connection failed" error right after tapping Connect
- Returns to scanning screen quickly
- No connection progress shown

**Possible Causes:**
1. Device not in connectable mode
2. Another device already connected
3. Device firmware issue
4. Bluetooth compatibility problem

**Solutions:**
1. **Check Device State**: Ensure device is advertising and connectable
2. **Disconnect Other Apps**: Close any other apps that might be connected
3. **Power Cycle Device**: Turn device off/on
4. **Check Firmware**: Verify device has compatible firmware

### Problem: Connection Times Out

**Symptoms:**
- Connecting spinner shows for 10-30 seconds
- Then "Connection timeout" error
- Device remains in list but won't connect

**Possible Causes:**
1. Weak Bluetooth signal
2. Device busy with other operations
3. Bluetooth interference
4. Device hardware issue

**Solutions:**
1. **Improve Signal**: Move closer to device
2. **Reduce Interference**: Move away from other Bluetooth devices
3. **Wait and Retry**: Device might be busy, try again in 30 seconds
4. **Check Device**: Ensure device isn't malfunctioning

### Problem: Frequent Disconnections

**Symptoms:**
- Connects successfully but disconnects randomly
- "Device disconnected" messages during use
- Have to reconnect frequently

**Possible Causes:**
1. Unstable Bluetooth signal
2. Low device battery
3. Device moving out of range
4. Environmental interference

**Solutions:**
1. **Maintain Proximity**: Keep phone within 5 meters of device
2. **Check Battery**: Ensure device has adequate power
3. **Stable Environment**: Avoid moving either device
4. **Minimize Interference**: Reduce other wireless devices nearby

## Configuration Issues

### Problem: Configuration Won't Save

**Symptoms:**
- "Failed to save configuration" error
- Changes disappear after app restart
- Save button doesn't respond

**Possible Causes:**
1. Bluetooth connection lost during save
2. Device battery too low
3. Invalid configuration values
4. Device write protection enabled

**Solutions:**
1. **Check Connection**: Ensure stable Bluetooth connection
2. **Verify Battery**: Check device has sufficient power
3. **Validate Values**: Ensure all fields have correct formats
4. **Retry Save**: Try saving again with stable connection

### Problem: Configuration Changes Not Applied

**Symptoms:**
- Save succeeds but device behaves differently
- Settings show saved but don't take effect
- Device continues with old configuration

**Possible Causes:**
1. Device reboot required
2. Configuration cached in device
3. Firmware compatibility issue

**Solutions:**
1. **Reboot Device**: Power cycle the datalogger
2. **Wait**: Allow time for configuration to take effect
3. **Reconnect**: Disconnect and reconnect from app
4. **Check Firmware**: Verify firmware supports configuration

## OTA Update Problems

### Problem: OTA Update Fails at Start

**Symptoms:**
- "Device not ready for update" error
- "Failed to initialize update" message
- Update won't begin

**Possible Causes:**
1. Device busy with other operations
2. Low device battery
3. Poor Bluetooth connection
4. Incompatible firmware file

**Solutions:**
1. **Wait**: Allow device to finish current operations
2. **Check Battery**: Ensure >50% battery (preferably >80%)
3. **Improve Connection**: Move closer, reduce interference
4. **Verify File**: Ensure correct firmware file selected

### Problem: OTA Update Interrupts During Upload

**Symptoms:**
- Progress stops mid-upload
- "Connection lost" error
- Partial update status

**Possible Causes:**
1. Bluetooth disconnection
2. Device moved during update
3. Battery died during update
4. Interference during transfer

**Solutions:**
1. **Reconnect**: Re-establish Bluetooth connection
2. **Check Resume**: Look for resume update option
3. **Restart Update**: If no resume, start over
4. **Prevent Future**: Ensure stable environment for retry

### Problem: Device Unresponsive After Update

**Symptoms:**
- Device won't reconnect after update
- No response to Bluetooth commands
- Appears "bricked" or dead

**Possible Causes:**
1. Update corrupted during transfer
2. Power loss during critical phase
3. Incompatible firmware
4. Hardware failure during update

**Recovery Steps:**
1. **Wait**: Give device 2-3 minutes to complete reboot
2. **Power Cycle**: Turn device completely off/on
3. **Reconnect**: Try connecting from app again
4. **Recovery Mode**: Contact ADARKO support for recovery firmware

### Problem: Wrong Firmware File Selected

**Symptoms:**
- "Invalid firmware file" error
- "Incompatible version" message
- Update rejected

**Possible Causes:**
1. Wrong device model firmware
2. Corrupted download
3. Outdated firmware file

**Solutions:**
1. **Verify Model**: Ensure firmware matches device model
2. **Re-download**: Get fresh firmware from official source
3. **Check Integrity**: Verify file size and checksum if available

## Permission and Bluetooth Issues

### Problem: Bluetooth Permissions Denied

**Symptoms:**
- "Bluetooth permission required" error
- Scanning doesn't start
- App requests permissions repeatedly

**Solutions:**
1. **Grant Permissions**: Tap "Allow" when prompted
2. **System Settings**: Go to Settings > Apps > ADARKO Datalogger > Permissions
3. **Enable Manually**: Toggle Bluetooth permissions on
4. **App Restart**: Close and reopen app after granting

### Problem: Location Permission Issue

**Symptoms:**
- "Location permission required" despite granting
- Android devices require location for Bluetooth scanning

**Solutions:**
1. **Grant Location**: Allow location access
2. **Precise Location**: Enable "Use precise location" if available
3. **Background Access**: Allow "All the time" for reliability

### Problem: Bluetooth Won't Enable

**Symptoms:**
- Can't turn on Bluetooth in app
- "Bluetooth unavailable" error

**Solutions:**
1. **System Settings**: Enable Bluetooth in phone settings
2. **Airplane Mode**: Ensure not in airplane mode
3. **Restart Phone**: Reboot device to reset Bluetooth
4. **Check Hardware**: Verify phone Bluetooth works with other devices

## App Performance Issues

### Problem: App Runs Slowly

**Symptoms:**
- Delayed responses
- Scanning takes longer than usual
- Freezes or stutters

**Possible Causes:**
1. Phone running low on memory
2. Too many background apps
3. Outdated app version
4. Phone overheating

**Solutions:**
1. **Close Apps**: Close unnecessary background apps
2. **Restart App**: Close and reopen ADARKO Datalogger
3. **Restart Phone**: Reboot phone to clear memory
4. **Update App**: Check for app updates in Play Store

### Problem: App Crashes or Freezes

**Symptoms:**
- App suddenly closes
- Screen becomes unresponsive
- "App not responding" message

**Possible Causes:**
1. Memory issues
2. Bluetooth driver problems
3. App bugs
4. Phone compatibility issues

**Solutions:**
1. **Restart App**: Close and reopen
2. **Clear Cache**: Settings > Apps > ADARKO Datalogger > Storage > Clear cache
3. **Update App**: Install latest version
4. **Restart Phone**: Reboot to clear system issues

## Device-Specific Issues

### Problem: Device Shows Unknown Status

**Symptoms:**
- Device connects but shows "Unknown" everywhere
- Configuration fields empty
- Operations fail

**Possible Causes:**
1. Incompatible device firmware
2. Communication protocol mismatch
3. Device hardware failure

**Solutions:**
1. **Check Compatibility**: Verify device is ADARKO datalogger
2. **Update Firmware**: Try OTA update if possible
3. **Contact Support**: Device may need service

### Problem: Inconsistent Device Behavior

**Symptoms:**
- Device works sometimes, fails others
- Random errors
- Unpredictable responses

**Possible Causes:**
1. Power supply issues
2. Environmental factors
3. Firmware bugs
4. Hardware degradation

**Solutions:**
1. **Stable Power**: Ensure consistent power source
2. **Environmental Control**: Avoid extreme temperatures/humidity
3. **Firmware Update**: Apply latest firmware
4. **Hardware Check**: Inspect device for damage

## Getting Additional Help

### When to Contact Support
- Problems persist after trying all solutions
- Device appears physically damaged
- Firmware update completely fails
- App crashes repeatedly

### Information to Provide
- Device model and serial number
- Current firmware version
- Phone model and Android version
- Exact error messages
- Steps to reproduce the problem

### Support Resources
- **ADARKO Support Website**: support.adarko.com
- **User Forums**: community.adarko.com
- **Phone Support**: 1-800-ADARKO
- **Email Support**: support@adarko.com

---

*Note: Most issues can be resolved with the troubleshooting steps above. If problems persist, gather all relevant information before contacting support.*