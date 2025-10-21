import Constants from 'expo-constants';

// Get API URL from app.json extra config or environment
const getApiUrl = () => {
  // For production, this will be set to your deployed backend URL
  const apiUrl = Constants.expoConfig?.extra?.apiUrl;

  if (!apiUrl) {
    console.warn('API URL not configured in app.json. Using default localhost.');
    return 'http://localhost:3001';
  }

  return apiUrl;
};

export const API_BASE_URL = getApiUrl();

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  REFRESH: '/api/auth/refresh',

  // Patients
  PATIENTS: '/api/patients',
  PATIENT_DETAIL: (id) => `/api/patients/${id}`,

  // Vitals
  VITALS: (patientId) => `/api/patients/${patientId}/vitals`,

  // Lab Results
  LABS: (patientId) => `/api/patients/${patientId}/labs`,
  LAB_DETAIL: (patientId, labId) => `/api/patients/${patientId}/labs/${labId}`,

  // Imaging
  IMAGING: (patientId) => `/api/patients/${patientId}/imaging`,
  IMAGING_DETAIL: (patientId, imagingId) => `/api/patients/${patientId}/imaging/${imagingId}`,

  // OCR
  OCR_UPLOAD: (patientId) => `/api/ocr/patients/${patientId}/upload`,
  OCR_RESULTS: (patientId) => `/api/ocr/patients/${patientId}/results`,

  // AI Chat
  CHAT: (patientId) => `/api/chat/patients/${patientId}`,
  CHAT_HISTORY: (patientId) => `/api/chat/patients/${patientId}/history`,

  // AI Analysis
  AI_ANALYZE: '/api/ai/analyze',
  AI_DIAGNOSIS: '/api/ai/diagnosis',
};

// Helper function to build full URL
export const buildUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

console.log('🌐 API Base URL:', API_BASE_URL);
