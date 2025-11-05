import axios from 'axios';
import { supabase } from '../config/supabase';
import { API_BASE_URL } from '../config/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - automatically add Supabase session token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get current session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session && session.access_token) {
        // Add auth token to request headers
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error('Error getting session for request:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - token might be expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the session
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !session) {
          // Sign out user if refresh fails
          await supabase.auth.signOut();
          return Promise.reject(error);
        }

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Sign out user if refresh fails
        await supabase.auth.signOut();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;