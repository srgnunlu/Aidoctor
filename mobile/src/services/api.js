import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';

let store;

export const setStore = (reduxStore) => {
  store = reduxStore;
};

const api = axios.create({
  baseURL: 'https://15e9cc46-730a-4eb2-899b-69e93b81757d-00-os7rvp0fmmje.riker.replit.dev:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken(true);
        config.headers.Authorization = `Bearer ${token}`;
        await AsyncStorage.setItem('accessToken', token);
      } else {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('accessToken');
      
      if (store) {
        const { logout } = await import('../store/slices/authSlice');
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

export default api;
