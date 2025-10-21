import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMedicalHistory = createAsyncThunk(
  'medicalHistory/fetchMedicalHistory',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patients/${patientId}/history`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch medical history');
    }
  }
);

export const createMedicalHistory = createAsyncThunk(
  'medicalHistory/createMedicalHistory',
  async ({ patientId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/patients/${patientId}/history`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create medical history');
    }
  }
);

export const updateMedicalHistory = createAsyncThunk(
  'medicalHistory/updateMedicalHistory',
  async ({ patientId, historyId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/patients/${patientId}/history/${historyId}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update medical history');
    }
  }
);

const medicalHistorySlice = createSlice({
  name: 'medicalHistory',
  initialState: {
    history: null,
    loading: false,
    error: null,
    saveLoading: false,
    saveError: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicalHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchMedicalHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createMedicalHistory.pending, (state) => {
        state.saveLoading = true;
        state.saveError = null;
      })
      .addCase(createMedicalHistory.fulfilled, (state, action) => {
        state.saveLoading = false;
        state.history = action.payload;
      })
      .addCase(createMedicalHistory.rejected, (state, action) => {
        state.saveLoading = false;
        state.saveError = action.payload;
      })
      .addCase(updateMedicalHistory.pending, (state) => {
        state.saveLoading = true;
        state.saveError = null;
      })
      .addCase(updateMedicalHistory.fulfilled, (state, action) => {
        state.saveLoading = false;
        state.history = action.payload;
      })
      .addCase(updateMedicalHistory.rejected, (state, action) => {
        state.saveLoading = false;
        state.saveError = action.payload;
      });
  },
});

export const { clearError } = medicalHistorySlice.actions;
export default medicalHistorySlice.reducer;
