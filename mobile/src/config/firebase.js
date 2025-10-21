import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDRQcCbgtzSjq0uO-6rr3lmxfJBbbFrxbA",
  authDomain: "aidoctor-5e9b2.firebaseapp.com",
  projectId: "aidoctor-5e9b2",
  storageBucket: "aidoctor-5e9b2.firebasestorage.app",
  messagingSenderId: "1009492626031",
  appId: "1:1009492626031:web:ff182a2adf57d33b77db9a",
  measurementId: "G-1PH6MXMKRS"
};

const app = initializeApp(firebaseConfig);

let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;
