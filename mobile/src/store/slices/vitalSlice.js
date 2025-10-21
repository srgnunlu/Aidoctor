import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchVitalSigns = createAsyncThunk(
  'vital/fetchVitalSigns',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patients/${patientId}/vitals`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vital signs');
    }
  }
);

export const createVitalSign = createAsyncThunk(
  'vital/createVitalSign',
  async ({ patientId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/patients/${patientId}/vitals`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create vital sign');
    }
  }
);

const vitalSlice = createSlice({
  name: 'vital',
  initialState: {
    vitals: [],
    loading: false,
    error: null,
    createLoading: false,
    createError: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createError = null;
    },
    setRealtimeVitals: (state, action) => {
      state.vitals = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVitalSigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVitalSigns.fulfilled, (state, action) => {
        state.loading = false;
        state.vitals = action.payload;
      })
      .addCase(fetchVitalSigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createVitalSign.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createVitalSign.fulfilled, (state, action) => {
        state.createLoading = false;
        state.vitals.unshift(action.payload);
      })
      .addCase(createVitalSign.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      });
  },
});

export const { clearError, setRealtimeVitals } = vitalSlice.actions;
export default vitalSlice.reducer;
