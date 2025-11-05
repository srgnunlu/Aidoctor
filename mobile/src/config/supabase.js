import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Supabase configuration
const getSupabaseConfig = () => {
  // Get configuration from app.json extra config or use defaults
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.SUPABASE_URL;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key not configured. Please set them in app.json or environment.');
  }

  return {
    supabaseUrl,
    supabaseAnonKey
  };
};

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error.message);
    return null;
  }
  return user;
};

// Helper function to get current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting current session:', error.message);
    return null;
  }
  return session;
};

export default supabase;