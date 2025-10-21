import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchImagingResults = createAsyncThunk(
  'imaging/fetchImagingResults',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patients/${patientId}/imaging`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch imaging results');
    }
  }
);

export const createImagingResult = createAsyncThunk(
  'imaging/createImagingResult',
  async ({ patientId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/patients/${patientId}/imaging`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create imaging result');
    }
  }
);

const imagingSlice = createSlice({
  name: 'imaging',
  initialState: {
    imaging: [],
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
    setRealtimeImaging: (state, action) => {
      state.imaging = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImagingResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImagingResults.fulfilled, (state, action) => {
        state.loading = false;
        state.imaging = action.payload;
      })
      .addCase(fetchImagingResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createImagingResult.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createImagingResult.fulfilled, (state, action) => {
        state.createLoading = false;
        state.imaging.unshift(action.payload);
      })
      .addCase(createImagingResult.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      });
  },
});

export const { clearError, setRealtimeImaging } = imagingSlice.actions;
export default imagingSlice.reducer;
