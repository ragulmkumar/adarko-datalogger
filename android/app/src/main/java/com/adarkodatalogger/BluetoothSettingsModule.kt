package com.adarkodatalogger

import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BluetoothSettingsModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

  companion object {
    const val NAME = "BluetoothModule"
  }

  override fun getName(): String = NAME

  @ReactMethod
  fun openSettings(promise: Promise) {
    try {
      val intent = Intent(Settings.ACTION_BLUETOOTH_SETTINGS)
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      reactApplicationContext.startActivity(intent)
      promise.resolve("Bluetooth settings opened")
    } catch (e: Exception) {
      promise.reject("BLUETOOTH_SETTINGS_ERROR", "Failed to open Bluetooth settings", e)
    }
  }
}
