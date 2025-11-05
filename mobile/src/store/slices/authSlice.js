import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../config/supabase';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, name, title, specialty, phone }, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, {
        email,
        password,
        name,
        title,
        specialty,
        phone,
      });
      
      // Store the session
      if (response.data.session) {
        await supabase.auth.setSession({
          access_token: response.data.session.access_token,
          refresh_token: response.data.session.refresh_token,
        });
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      // Get user profile from backend
      const response = await api.get(API_ENDPOINTS.REFRESH, {
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`,
        },
      });

      return {
        user: response.data.data,
        session: authData.session,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await supabase.auth.signOut();
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const checkAuthState = createAsyncThunk(
  'auth/checkState',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return null;
      }

      // Get user profile from backend
      const response = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      return {
        user: response.data.data,
        session: session,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const initialState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSession: (state, action) => {
      state.session = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Registration failed';
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.session = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Logout failed';
      })
      // Check auth state
      .addCase(checkAuthState.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.session = action.payload.session;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.session = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuthState.rejected, (state) => {
        state.isCheckingAuth = false;
        state.user = null;
        state.session = null;
        state.isAuthenticated = false;
      })
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Profile update failed';
      });
  },
});

export const { clearError, setSession } = authSlice.actions;
export default authSlice.reducer;