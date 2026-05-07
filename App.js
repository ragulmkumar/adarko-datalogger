import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BLEScanScreen from './src/Screens/BLEScanScreen';
import DeviceDetailsScreen from './src/Screens/DeviceDetailsScreen';
import { requestPermissions } from './src/utils/Permissions';

const Stack = createNativeStackNavigator();

const App = () => {
  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="BLEScan" 
          component={BLEScanScreen} 
          options={{ title: 'Scan BLE Devices' }}
        />
        <Stack.Screen 
          name="DeviceDetails" 
          component={DeviceDetailsScreen} 
          options={{ title: 'Device Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;