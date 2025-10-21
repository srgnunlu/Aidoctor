import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ patientId, message }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/patients/${patientId}/chat`, { message });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const fetchChatHistory = createAsyncThunk(
  'chat/fetchHistory',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patients/${patientId}/chat`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chat history');
    }
  }
);

export const clearChatHistory = createAsyncThunk(
  'chat/clearHistory',
  async (patientId, { rejectWithValue }) => {
    try {
      await api.delete(`/patients/${patientId}/chat`);
      return patientId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear chat');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    loading: false,
    sending: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setRealtimeMessages: (state, action) => {
      state.messages = action.payload;
      state.loading = false;
    },
    addRealtimeMessage: (state, action) => {
      const existingIndex = state.messages.findIndex(msg => msg.id === action.payload.id);
      if (existingIndex === -1) {
        state.messages.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.messages.push(action.payload.userMessage);
        state.messages.push(action.payload.aiMessage);
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearChatHistory.fulfilled, (state) => {
        state.messages = [];
      });
  },
});

export const { clearError, clearMessages, setRealtimeMessages, addRealtimeMessage } = chatSlice.actions;
export default chatSlice.reducer;
