# Frequently Asked Questions

This section answers common questions about the ADARKO Datalogger app and datalogger devices.

## Getting Started

### Q: What is the ADARKO Datalogger app?
**A:** The ADARKO Datalogger app is a mobile application that allows you to discover, connect to, and manage ADARKO datalogger devices using Bluetooth. It provides tools to configure device settings and perform firmware updates wirelessly.

### Q: What devices work with this app?
**A:** The app works with ADARKO datalogger devices that support Bluetooth Low Energy (BLE) communication. These are specialized sensors and data collection devices used for environmental monitoring, asset tracking, and equipment monitoring.

### Q: Do I need an internet connection to use the app?
**A:** No, you don't need internet for basic device connection and configuration. However, internet is required for downloading firmware updates and accessing online documentation.

### Q: Is the app free to download?
**A:** Yes, the ADARKO Datalogger app is free to download from the Google Play Store. However, you need compatible ADARKO datalogger hardware to use it effectively.

## Device Connection

### Q: Why can't I find my device during scanning?
**A:** Several factors can prevent device discovery:
- Device is powered off or has low battery
- Device is more than 10 meters away
- Bluetooth is disabled on your phone
- Device is already connected to another app
- Physical obstacles blocking Bluetooth signal

Try moving closer to the device, ensuring it's powered on, and checking that no other apps are connected to it.

### Q: My device connects but then disconnects immediately. Why?
**A:** This usually indicates:
- Weak Bluetooth signal - move closer
- Low device battery - replace batteries
- Device malfunction - try power cycling
- Another device trying to connect - ensure exclusive access

### Q: Can I connect to multiple devices at once?
**A:** No, the app connects to one device at a time. Disconnect from the current device before connecting to another.

### Q: How far can I be from the device?
**A:** Bluetooth range is typically 5-10 meters (16-33 feet) in open space. Walls, interference, and other obstacles can reduce this range. For best results, stay within 5 meters during connection and configuration.

## Configuration

### Q: What does the APN setting do?
**A:** APN (Access Point Name) tells your datalogger which cellular network to use for data transmission. You need to set this to your cellular carrier's APN (e.g., "fast.t-mobile.com" for T-Mobile).

### Q: How do I know what server address and port to use?
**A:** These settings are provided by your system administrator or IT department. They point to the server where your datalogger will send its collected data. Contact your IT team for the correct values.

### Q: What send interval should I choose?
**A:** The choice depends on your needs:
- **1 Hour**: For real-time monitoring or critical applications
- **6-8 Hours**: Good balance for most monitoring applications
- **12-24 Hours**: For power conservation or periodic checks

Shorter intervals use more battery and data, but provide more frequent updates.

### Q: Can I change settings remotely?
**A:** No, configuration changes require a Bluetooth connection to the device. You must be within Bluetooth range to modify device settings.

## Firmware Updates

### Q: What is firmware and why update it?
**A:** Firmware is the software that runs on your datalogger device. Updates can:
- Fix bugs and improve stability
- Add new features
- Enhance security
- Improve battery life
- Fix compatibility issues

### Q: How do I know if my device needs an update?
**A:** Check the Firmware Version in the Configuration tab. Compare it with the latest version available from ADARKO. The app will also notify you if updates are available.

### Q: Is it safe to update firmware?
**A:** Yes, but follow these precautions:
- Ensure device battery is above 50% (preferably 80%+)
- Keep phone within 2-3 meters during update
- Don't close the app or turn off either device
- Have a stable Bluetooth connection

### Q: What happens if firmware update fails?
**A:** Most failures are recoverable. The device may automatically recover, or you may need to:
- Wait for device reboot
- Power cycle the device
- Retry the update
- Contact support if device becomes unresponsive

### Q: Can I use the device during firmware update?
**A:** No, the device is busy during update and cannot perform normal operations. Data collection and transmission will pause until the update completes.

## Technical Questions

### Q: What Android versions does the app support?
**A:** The app requires Android 8.0 (API level 26) or later. It may work on older versions but is not officially supported.

### Q: Why does the app need location permission?
**A:** Android requires location permission for Bluetooth scanning. This is a system requirement, not because the app tracks your location. The permission is only used to enable BLE device discovery.

### Q: Can I use this app on iOS?
**A:** Currently, the app is only available for Android devices. iOS support may be added in future versions.

### Q: How secure is the Bluetooth connection?
**A:** The app uses standard Bluetooth Low Energy security protocols. Data transmission is encrypted, and connections require pairing. However, Bluetooth has a limited range, so physical security is also important.

### Q: Does the app store my data?
**A:** The app only stores temporary connection information and user preferences locally on your device. It does not upload or store your datalogger data. All data transmission is handled directly by the datalogger devices to your configured server.

## Battery and Power

### Q: How long does device battery last?
**A:** Battery life depends on:
- Send interval (longer intervals = better battery life)
- Environmental conditions
- Device model and firmware version

Typical battery life ranges from weeks to months with standard settings.

### Q: What type of batteries do the devices use?
**A:** Most ADARKO dataloggers use standard AA or AAA batteries. Some models support rechargeable batteries. Check your device manual for specific battery requirements.

### Q: Can I leave devices running indefinitely?
**A:** Yes, but regular battery replacement or recharging is required. The app helps you monitor battery status through configuration readings.

## Data and Monitoring

### Q: Where does my data go?
**A:** Data is sent directly from the datalogger device to the server address you configured. The app itself doesn't store or transmit your data - it only configures the device.

### Q: How do I know if data transmission is working?
**A:** Check the device configuration to ensure correct server settings. You can also monitor server logs or use network monitoring tools to verify data receipt.

### Q: Can I view collected data in the app?
**A:** No, the app is for device management only. Data viewing and analysis happens on your server or through separate monitoring software.

## Troubleshooting

### Q: The app keeps asking for permissions. Why?
**A:** Permissions may have been denied or revoked. Go to your phone's Settings > Apps > ADARKO Datalogger > Permissions and ensure all required permissions are granted.

### Q: Why does scanning take so long?
**A:** Scanning searches for BLE devices for up to 15 seconds. If no devices are found quickly, it continues the full time. Weak signals or interference can also slow down the process.

### Q: My device worked before but now doesn't connect. What changed?
**A:** Possible causes:
- Device battery died
- Device was moved out of range
- Phone Bluetooth was reset
- Another app connected to the device
- Device firmware was updated externally

### Q: Can I reset the device to factory settings?
**A:** Some devices support factory reset through specific button combinations or firmware commands. Check your device manual or contact ADARKO support for reset procedures.

## Support and Updates

### Q: How do I get help?
**A:** 
- Check this user manual first
- Visit the troubleshooting section
- Contact ADARKO support:
  - Website: support.adarko.com
  - Phone: 1-800-ADARKO
  - Email: support@adarko.com

### Q: How do I report bugs?
**A:** When reporting issues, include:
- App version
- Phone model and Android version
- Device model and firmware version
- Steps to reproduce the problem
- Exact error messages

### Q: Are app updates automatic?
**A:** App updates are handled through the Google Play Store. You can enable automatic updates in Play Store settings, or manually check for updates.

### Q: Will my settings be lost when updating the app?
**A:** No, app updates don't affect device configurations. Your datalogger settings are stored on the device itself, not in the app.

## Advanced Usage

### Q: Can I automate device management?
**A:** The current app version requires manual operation. Future versions may include automation features.

### Q: Can I export device configurations?
**A:** You can manually record settings, but automatic export isn't currently supported. Take screenshots or notes of your configurations.

### Q: Is there an API for integration?
**A:** The app doesn't expose an API. Device data is sent to your configured server, where you can build integrations.

---

*Note: This FAQ covers common questions. For device-specific questions, refer to your datalogger manual or contact ADARKO technical support.*