import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BLEScanScreen from './src/Screens/BLEScanScreen';
import DeviceDetailsScreen from './src/Screens/DeviceDetailsScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: '#1A2B4C',
            },
            headerTintColor: '#007AFF',
            headerBackTitle: 'Back',
            headerTitleAlign: 'center', // This centers the title
            headerTitle: 'ADARKO Datalogger', // Default title for all screens
          }}
        >
          <Stack.Screen
            name="BLEScan"
            component={BLEScanScreen}
            options={{
              title: 'ADARKO Datalogger',
            }}
          />
          <Stack.Screen
            name="DeviceDetails"
            component={DeviceDetailsScreen}
            options={{
              title: 'ADARKO Datalogger',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
};

export default App;
