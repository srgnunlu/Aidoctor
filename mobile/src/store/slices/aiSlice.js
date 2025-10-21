import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const analyzePatient = createAsyncThunk(
  'ai/analyzePatient',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/patients/${patientId}/analyze`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to analyze patient');
    }
  }
);

export const fetchAnalyses = createAsyncThunk(
  'ai/fetchAnalyses',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patients/${patientId}/analyses`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analyses');
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    analyses: [],
    currentAnalysis: null,
    loading: false,
    analyzing: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAnalysis: (state) => {
      state.currentAnalysis = null;
    },
    setRealtimeAnalyses: (state, action) => {
      state.analyses = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzePatient.pending, (state) => {
        state.analyzing = true;
        state.error = null;
      })
      .addCase(analyzePatient.fulfilled, (state, action) => {
        state.analyzing = false;
        state.currentAnalysis = action.payload;
        state.analyses.unshift(action.payload);
      })
      .addCase(analyzePatient.rejected, (state, action) => {
        state.analyzing = false;
        state.error = action.payload;
      })
      .addCase(fetchAnalyses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyses.fulfilled, (state, action) => {
        state.loading = false;
        state.analyses = action.payload;
      })
      .addCase(fetchAnalyses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentAnalysis, setRealtimeAnalyses } = aiSlice.actions;
export default aiSlice.reducer;
