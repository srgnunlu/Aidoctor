const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

let supabaseAdmin;
let supabaseClient;

/**
 * Initialize Supabase Admin client (with service_role key)
 * Use this for admin operations like user management
 */
const initializeSupabaseAdmin = () => {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    logger.info('Supabase Admin client initialized successfully');
    return supabaseAdmin;
  } catch (error) {
    logger.error('Failed to initialize Supabase Admin client', { error: error.message });
    throw error;
  }
};

/**
 * Initialize Supabase client (with anon key)
 * Use this for regular operations
 */
const initializeSupabaseClient = () => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    logger.info('Supabase client initialized successfully');
    return supabaseClient;
  } catch (error) {
    logger.error('Failed to initialize Supabase client', { error: error.message });
    throw error;
  }
};

/**
 * Get Supabase admin client
 */
const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    initializeSupabaseAdmin();
  }
  return supabaseAdmin;
};

/**
 * Get Supabase client
 */
const getSupabaseClient = () => {
  if (!supabaseClient) {
    initializeSupabaseClient();
  }
  return supabaseClient;
};

/**
 * Get authenticated Supabase client for a specific user
 * @param {string} accessToken - User's access token
 */
const getAuthenticatedClient = (accessToken) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
};

module.exports = {
  initializeSupabaseAdmin,
  initializeSupabaseClient,
  getSupabaseAdmin,
  getSupabaseClient,
  getAuthenticatedClient
};