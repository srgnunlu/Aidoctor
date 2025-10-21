import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchLabResults = createAsyncThunk(
  'lab/fetchLabResults',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patients/${patientId}/labs`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lab results');
    }
  }
);

export const createLabResult = createAsyncThunk(
  'lab/createLabResult',
  async ({ patientId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/patients/${patientId}/labs`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create lab result');
    }
  }
);

export const updateLabStatus = createAsyncThunk(
  'lab/updateLabStatus',
  async ({ patientId, labId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/patients/${patientId}/labs/${labId}/status`, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lab status');
    }
  }
);

export const updateLabResult = createAsyncThunk(
  'lab/updateLabResult',
  async ({ patientId, labId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/patients/${patientId}/labs/${labId}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lab result');
    }
  }
);

const labSlice = createSlice({
  name: 'lab',
  initialState: {
    labs: [],
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
    setRealtimeLabs: (state, action) => {
      state.labs = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLabResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabResults.fulfilled, (state, action) => {
        state.loading = false;
        state.labs = action.payload;
      })
      .addCase(fetchLabResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLabResult.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createLabResult.fulfilled, (state, action) => {
        state.createLoading = false;
        state.labs.unshift(action.payload);
      })
      .addCase(createLabResult.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      .addCase(updateLabStatus.fulfilled, (state, action) => {
        const index = state.labs.findIndex(lab => lab.id === action.payload.id);
        if (index !== -1) {
          state.labs[index] = action.payload;
        }
      })
      .addCase(updateLabResult.fulfilled, (state, action) => {
        const index = state.labs.findIndex(lab => lab.id === action.payload.id);
        if (index !== -1) {
          state.labs[index] = action.payload;
        }
      });
  },
});

export const { clearError, setRealtimeLabs } = labSlice.actions;
export default labSlice.reducer;
