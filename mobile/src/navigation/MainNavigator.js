import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PatientListScreen from '../screens/PatientListScreen';
import PatientDetailScreen from '../screens/patient/PatientDetailScreen';
import colors from '../constants/colors';

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="PatientList"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="PatientList" 
        component={PatientListScreen}
        options={{ title: 'Hastalar' }}
      />
      <Stack.Screen 
        name="PatientDetail" 
        component={PatientDetailScreen}
        options={{ title: 'Hasta Detayı' }}
      />
    </Stack.Navigator>
  );
}
