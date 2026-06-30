# ADARKO Datalogger Mobile Application

## User Manual

---

**Version 1.0 • Official Release**  
© ADARKO INNOVATION LLP. All rights reserved.

---

# Table of Contents

1. Introduction  
   1.1 What Is the ADARKO Datalogger App?  
   1.2 Key Features  
   1.3 System Requirements

2. Getting Started  
   2.1 Opening the Application  
   2.2 Granting Required Permissions

3. Device Scanning and Connection  
   3.1 Scanning for Devices  
   3.2 Understanding Signal Strength  
   3.3 Connecting to a Device  
   3.4 Stopping Device Scanning  
   3.5 Device Details

4. Device Configuration  
   4.1 Configuration Screen Overview  
   4.2 Device Information Section  
   4.3 Configuration Settings Section  
   4.4 Writing Configuration to the Device  
   4.5 Important Configuration Guidelines

5. OTA Firmware Updates  
   5.1 OTA Update Screen Overview  
   5.2 Before Starting an OTA Update  
   5.3 Selecting a Firmware File  
   5.4 Starting the Firmware Upload  
   5.5 Upload Completion and Device Reboot  
   5.6 Important OTA Guidelines

6. Status Indicators and Notifications  
   6.1 Connection Status  
   6.2 Firmware Update Status  
   6.3 Warning and Error Messages

7. Support and Contact Information

---

# 1. Introduction

Welcome to the ADARKO Datalogger mobile application.

The ADARKO Datalogger app allows you to connect, configure, and manage compatible ADARKO datalogger devices directly from your Android smartphone using Bluetooth Low Energy (BLE) technology.

With this app, you can:

- Scan and connect to nearby datalogger devices
- View and update device configurations
- Perform wireless firmware (OTA) updates
- Monitor connection and device status
- Manage device communication settings

This user manual will guide you through each feature step-by-step, helping you set up and operate your datalogger devices safely and efficiently.

---

# 1.1 What Is the ADARKO Datalogger App?

ADARKO dataloggers are smart electronic devices designed to collect and transmit environmental or operational data. Depending on the device model and deployment, dataloggers may monitor values such as temperature, humidity, pressure, or other sensor-based measurements.

The ADARKO Datalogger mobile app acts as a wireless management tool that allows you to communicate with these devices over Bluetooth.

Using the app, you can:

- Discover nearby devices
- Connect securely through Bluetooth
- Configure device settings
- Update device firmware wirelessly
- Verify device information and status

The app is designed to provide a simple and reliable user experience for both first-time users and field technicians.

---

# 1.2 Key Features

| Feature                  | Description                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| Device Discovery         | Quickly scan for nearby ADARKO datalogger devices using Bluetooth Low Energy (BLE).            |
| Secure Connection        | Connect securely to supported datalogger devices for configuration and firmware management.    |
| Configuration Management | Update network settings, server information, and transmission intervals directly from the app. |
| Firmware Updates (OTA)   | Perform wireless firmware updates without cables or additional hardware.                       |
| Real-Time Status         | Monitor device connection status and firmware update progress in real time.                    |
| User-Friendly Interface  | Clean and easy-to-use interface suitable for both beginners and technicians.                   |

### Supported Devices

The ADARKO Datalogger app is compatible with ADARKO datalogger devices that support Bluetooth Low Energy (BLE) communication.

Compatible devices are automatically detected during the scanning process when they are powered ON and within Bluetooth range.

---

# 1.3 System Requirements

| Requirement      | Minimum Specification              |
| ---------------- | ---------------------------------- |
| Operating System | Android 8.0 or later               |
| Bluetooth        | Bluetooth Low Energy (BLE) support |
| Storage          | Minimum 100 MB available storage   |
| RAM              | 2 GB RAM recommended               |

---

# 2. Getting Started

This section explains how to launch the application and complete the initial setup.

---

# 2.1 Opening the Application

After installing the app:

1. Locate the **ADARKO Datalogger** app icon on your Android device.
2. Tap the icon to open the application.

When the app starts:

- A loading screen may appear briefly
- Bluetooth availability is checked automatically
- Required permissions may be requested during first-time setup

---

# 2.2 Granting Required Permissions

The ADARKO Datalogger app requires certain Android permissions to communicate with BLE devices correctly.

Allow all requested permissions when prompted.

| Permission            | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| Bluetooth Scan        | Allows the app to search for nearby devices    |
| Bluetooth Connect     | Allows connection to detected devices          |
| Location (Fine)       | Required by Android for BLE scanning           |
| File Access / Storage | Allows firmware file selection for OTA updates |

> **Note:**  
> If permissions are denied accidentally, enable them manually from:  
> **Settings → Apps → ADARKO Datalogger → Permissions**

---

# 3. Device Scanning and Connection

This section explains how to scan for nearby datalogger devices and connect through Bluetooth.

---

# 3.1 Scanning for Devices

To scan for nearby ADARKO datalogger devices:

1. Enable Bluetooth on your phone
2. Open the ADARKO Datalogger app
3. Tap the blue Bluetooth scan button
4. Wait while the app searches for nearby devices
5. Available devices will appear automatically in the list

> **Note:**  
> Only supported ADARKO datalogger devices will appear in the scan results.

---

# 3.2 Understanding Signal Strength

Each discovered device displays a signal strength value (RSSI).

- Strong signal → More stable connection
- Weak signal → Move closer to the device

For reliable configuration and OTA updates, maintain a distance of approximately **2–5 meters** from the datalogger.

---

# 3.3 Connecting to a Device

After scanning:

1. Locate your datalogger device from the list
2. Tap the **Connect** button
3. Wait for the Bluetooth connection to complete

Once connected, the app automatically opens the **Device Details** screen.

From this screen, you can:

- View device information
- Update configuration settings
- Perform OTA firmware updates
- Monitor device status

---

# 3.4 Stopping Device Scanning

While scanning is active:

1. Tap the red **Stop** button
2. The scanning process stops immediately

Stopping scanning helps reduce unnecessary Bluetooth activity and saves battery power.

---

# 3.5 Device Details

After connecting to a datalogger, the app automatically opens the Device Details screen.

The screen contains:

- Device name
- Connection status indicator
- Back navigation button
- Disconnect button
- Configuration tab
- OTA Update tab

### Header Section

At the top of the screen:

- The **Back** button returns to the scanning page
- The **Device Name** shows the connected device
- The **Connection Status** indicates whether the device is connected
- The **Disconnect** button safely disconnects the device

---

# 4. Device Configuration

The Configuration tab allows you to view and update important datalogger settings directly from the mobile app.

---

# 4.1 Configuration Screen Overview

The configuration screen contains:

- Device Information card
- Configuration Settings card
- Write Configuration button
- Status messages

The app automatically reads the current device configuration and displays it on the screen.

---

# 4.2 Device Information Section

The Device Information section displays read-only information from the datalogger.

| Field            | Description                 |
| ---------------- | --------------------------- |
| EUI-64           | Unique hardware identifier  |
| Battery Voltage  | Current battery voltage     |
| Temperature      | Internal device temperature |
| Firmware Version | Installed firmware version  |
| Hardware Version | Device hardware revision    |

### Notes

- These values update automatically
- This section cannot be edited
- Battery and temperature values help monitor device health

---

# 4.3 Configuration Settings Section

This section allows modification of communication and network settings.

## APN

The APN (Access Point Name) is used by the SIM/network module for mobile data communication.

### Notes

- Enter the APN provided by your SIM/network operator
- Incorrect APN values may prevent data transmission

---

## Server Address

The server address defines where the datalogger sends collected data.

### Notes

- Can be a domain name or IP address
- Ensure the address is entered correctly

---

## Server Port

The server port defines the communication port used by the server.

### Notes

- Valid range: **1–65535**
- Incorrect values may block communication

---

## Send Interval

The Send Interval determines how often the datalogger sends data to the server.

| Interval | Description                    |
| -------- | ------------------------------ |
| 1 Hour   | Sends data every 1 hour        |
| 6 Hours  | Sends data every 6 hours       |
| 8 Hours  | Sends data every 8 hours       |
| 12 Hours | Sends data every 12 hours      |
| 24 Hours | Sends data once every 24 hours |

### Notes

- Shorter intervals increase update frequency
- Longer intervals help reduce battery usage

---

# 4.4 Writing Configuration to the Device

After editing settings:

1. Verify all values carefully
2. Tap the **Write Configuration** button
3. Wait for the process to complete

During writing:

- A loading indicator appears
- The button becomes temporarily disabled
- The app transfers configuration data through Bluetooth

If successful, a confirmation message appears:

> **Configuration written successfully**

---

# 4.5 Important Configuration Guidelines

Before writing configuration:

- Ensure the device remains connected
- Stay within Bluetooth range (2–5 meters recommended)
- Do not close the application during writing
- Avoid disabling Bluetooth during the process

If the connection is interrupted:

- Configuration changes may not save completely
- Reconnect and repeat the process

---

# 5. OTA Firmware Updates

The OTA (Over-The-Air) firmware update feature allows you to update datalogger firmware wirelessly using Bluetooth Low Energy (BLE).

Firmware updates may include:

- Performance improvements
- Bug fixes
- New features
- Security enhancements
- Stability improvements

The OTA process is designed to be simple and user-friendly for both first-time users and field technicians.

---

# 5.1 OTA Update Screen Overview

The OTA Update tab contains:

- Firmware Update card
- Select Firmware File button
- File Information section
- Start Firmware Upload button
- Upload Progress section
- OTA Process Steps
- Status and information messages

The screen guides the user through the firmware update process step-by-step.

---

# 5.2 Before Starting an OTA Update

Before performing a firmware update, ensure the following:

## Device Requirements

- The datalogger is powered ON
- The device is connected through Bluetooth
- The device supports OTA updates

## Phone Requirements

- Bluetooth is enabled
- Sufficient battery is available
- The firmware `.bin` file is already downloaded

## Connection Recommendations

For reliable OTA performance:

- Stay within 2–5 meters of the device
- Avoid moving far away during upload
- Do not disable Bluetooth
- Do not close the application during the update

---

# 5.3 Selecting a Firmware File

To begin the OTA process:

1. Open the **OTA Update** tab
2. Tap **Select Firmware File (.bin)**
3. Browse and select the firmware file
4. Wait for the app to load the file

After loading, the app displays:

- File name
- File size
- Total bytes
- Required memory sectors

## Supported File Type

Only firmware files with the `.bin` extension are supported.

### Notes

- Use only official firmware files provided by ADARKO
- Do not rename firmware files unless instructed
- Selecting an incorrect file may cause update failure

---

# 5.4 Starting the Firmware Upload

After selecting the firmware file:

1. Verify the displayed file information
2. Tap the **Start Firmware Upload** button
3. Wait while the device prepares for upload
4. The firmware transfer starts automatically

During upload:

- The progress bar updates automatically
- Upload percentage is displayed in real time
- Upload buttons become temporarily disabled

> **Important:**  
> Keep the phone close to the datalogger during the upload process.

---

# 5.5 Upload Completion and Device Reboot

After the firmware upload completes successfully:

- A success message appears
- The datalogger automatically reboots
- Bluetooth may disconnect temporarily
- The app may return to the scanning screen automatically

This behavior is normal.

After reboot:

1. Scan for the device again
2. Reconnect to the datalogger
3. Verify the updated firmware version if required

---

# 5.6 Important OTA Guidelines

For reliable firmware updates:

- Use only official ADARKO firmware files
- Do not power OFF the device during upload
- Do not disable Bluetooth during upload
- Do not move far away from the device
- Do not close the application while updating

If the upload fails:

1. Reconnect to the device
2. Move closer to the datalogger
3. Restart the OTA update process
4. Ensure the correct `.bin` file is selected

---

# 6. Status Indicators and Notifications

The application displays status indicators and notifications to help users monitor device activity and operations.

---

# 6.1 Connection Status

The connection status indicator shows whether the datalogger is connected through Bluetooth.

| Status       | Meaning                                 |
| ------------ | --------------------------------------- |
| Connected    | Device communication is active          |
| Disconnected | No active Bluetooth connection          |
| Scanning     | The app is searching for nearby devices |

---

# 6.2 Firmware Update Status

During OTA updates, the app displays:

- Upload progress percentage
- Firmware transfer progress bar
- Success messages
- Failure or interruption messages

These indicators help monitor update progress in real time.

---

# 6.3 Warning and Error Messages

The app may display warning or error messages in certain situations.

Examples include:

- Bluetooth disabled
- Device disconnected
- Invalid firmware file
- OTA update failed
- Configuration write failed

If an error occurs:

1. Reconnect to the device
2. Verify Bluetooth is enabled
3. Stay within range
4. Retry the operation

---

# 7. Support and Contact Information

For technical support, firmware assistance, or device-related inquiries, please contact ADARKO support.

**ADARKO INNOVATION LLP**  
Official Support Team

---
