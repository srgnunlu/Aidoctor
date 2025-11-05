const { getSupabaseAdmin } = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

const register = async (req, res) => {
  try {
    const { email, password, name, title, specialty, phone } = req.body;

    if (!email || !password || !name) {
      return errorResponse(res, 400, 'Email, password and name are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 400, 'Invalid email format');
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters');
    }

    const supabase = getSupabaseAdmin();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for now
      user_metadata: {
        name,
        title: title || '',
        specialty: specialty || '',
        phone: phone || '',
      }
    });

    if (authError) {
      logger.error('Supabase auth error during registration', { error: authError.message });
      
      if (authError.message.includes('already registered')) {
        return errorResponse(res, 400, 'User already exists with this email');
      }
      
      return errorResponse(res, 500, 'Registration failed', authError.message);
    }

    const user = authData.user;

    // Update user profile in users table (via trigger or manual)
    const { error: profileError } = await supabase
      .from('users')
      .update({
        name,
        title: title || '',
        specialty: specialty || '',
        phone: phone || '',
      })
      .eq('id', user.id);

    if (profileError) {
      logger.error('Error updating user profile', { error: profileError.message });
      // Don't fail registration if profile update fails
    }

    logger.info('New user registered', { email, userId: user.id });

    // Return user data - mobile app will handle sign in
    return successResponse(res, 201, 'User registered successfully', {
      user: {
        id: user.id,
        email: user.email,
        name,
        title: title || '',
        specialty: specialty || '',
        phone: phone || '',
        role: 'DOCTOR',
        subscription_type: 'FREE',
      },
      message: 'Please sign in with your credentials',
    });

  } catch (error) {
    logger.error('Registration error', { error: error.message });
    return errorResponse(res, 500, 'Registration failed', error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }

    const supabase = getSupabaseAdmin();

    // Sign in with email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      logger.error('Login error', { error: authError.message });
      return errorResponse(res, 401, 'Invalid credentials');
    }

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      logger.error('Error fetching user profile', { error: userError.message });
    }

    logger.info('User logged in', { email, userId: authData.user.id });

    return successResponse(res, 200, 'Login successful', {
      user: userData || {
        id: authData.user.id,
        email: authData.user.email,
      },
      session: authData.session,
      access_token: authData.session.access_token,
    });

  } catch (error) {
    logger.error('Login error', { error: error.message });
    return errorResponse(res, 500, 'Login failed', error.message);
  }
};

const getMe = async (req, res) => {
  try {
    const { userId } = req.user;
    const supabase = getSupabaseAdmin();

    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !userData) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'User profile retrieved', userData);

  } catch (error) {
    logger.error('Get profile error', { error: error.message });
    return errorResponse(res, 500, 'Failed to get profile', error.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, title, specialty, phone } = req.body;
    const supabase = getSupabaseAdmin();

    const updateData = {};
    
    if (name) updateData.name = name;
    if (title !== undefined) updateData.title = title;
    if (specialty !== undefined) updateData.specialty = specialty;
    if (phone !== undefined) updateData.phone = phone;

    const { data: userData, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Update profile error', { error: error.message });
      return errorResponse(res, 500, 'Failed to update profile', error.message);
    }

    logger.info('User profile updated', { userId });

    return successResponse(res, 200, 'Profile updated successfully', userData);

  } catch (error) {
    logger.error('Update profile error', { error: error.message });
    return errorResponse(res, 500, 'Failed to update profile', error.message);
  }
};

const logout = async (req, res) => {
  try {
    // With Supabase, logout is typically handled client-side
    // But we can revoke the session if needed
    
    logger.info('User logged out', { userId: req.user.userId });

    return successResponse(res, 200, 'Logged out successfully');

  } catch (error) {
    logger.error('Logout error', { error: error.message });
    return errorResponse(res, 500, 'Logout failed', error.message);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  logout,
};