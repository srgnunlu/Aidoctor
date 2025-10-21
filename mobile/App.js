import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as StoreProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import store from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { setStore } from './src/services/api';

setStore(store);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider store={store}>
        <PaperProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </PaperProvider>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}
