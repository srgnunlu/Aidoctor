import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchPatients = createAsyncThunk(
  'patient/fetchPatients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/patients');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patients');
    }
  }
);

export const createPatient = createAsyncThunk(
  'patient/createPatient',
  async (patientData, { rejectWithValue }) => {
    try {
      const response = await api.post('/patients', patientData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create patient');
    }
  }
);

export const updatePatient = createAsyncThunk(
  'patient/updatePatient',
  async ({ patientId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/patients/${patientId}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update patient');
    }
  }
);

export const deletePatient = createAsyncThunk(
  'patient/deletePatient',
  async (patientId, { rejectWithValue }) => {
    try {
      await api.delete(`/patients/${patientId}`);
      return patientId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete patient');
    }
  }
);

const patientSlice = createSlice({
  name: 'patient',
  initialState: {
    patients: [],
    loading: false,
    refreshing: false,
    error: null,
    createLoading: false,
    createError: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createError = null;
    },
    setRealtimePatients: (state, action) => {
      state.patients = action.payload;
      state.loading = false;
      state.refreshing = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state, action) => {
        if (action.meta.arg?.refresh) {
          state.refreshing = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload;
      })
      .addCase(createPatient.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.createLoading = false;
        state.patients.unshift(action.payload);
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        const index = state.patients.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.patients[index] = action.payload;
        }
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.patients = state.patients.filter(p => p.id !== action.payload);
      });
  },
});

export const { clearError, setRealtimePatients } = patientSlice.actions;
export default patientSlice.reducer;
