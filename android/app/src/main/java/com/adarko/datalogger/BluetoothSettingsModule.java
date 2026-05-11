package com.adarko.datalogger;

import android.content.Intent;
import android.provider.Settings;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;

public class BluetoothSettingsModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "BluetoothModule";

    public BluetoothSettingsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void openSettings(Promise promise) {
        try {
            Intent intent = new Intent(Settings.ACTION_BLUETOOTH_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
            promise.resolve("Bluetooth settings opened");
        } catch (Exception e) {
            promise.reject("BLUETOOTH_SETTINGS_ERROR", "Failed to open Bluetooth settings", e);
        }
    }
}
