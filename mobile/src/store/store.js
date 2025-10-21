import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import patientReducer from './slices/patientSlice';
import vitalReducer from './slices/vitalSlice';
import medicalHistoryReducer from './slices/medicalHistorySlice';
import labReducer from './slices/labSlice';
import imagingReducer from './slices/imagingSlice';
import aiReducer from './slices/aiSlice';
import chatReducer from './slices/chatSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    patient: patientReducer,
    vital: vitalReducer,
    medicalHistory: medicalHistoryReducer,
    lab: labReducer,
    imaging: imagingReducer,
    ai: aiReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
