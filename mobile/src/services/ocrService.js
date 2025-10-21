import api from './api';
import * as FileSystem from 'expo-file-system';

export const uploadImageToOCR = async (imageAsset, patientId, sourceType, category) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageAsset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const imageBase64 = `data:image/jpeg;base64,${base64}`;

    const ocrResponse = await api.post(`/ocr/${patientId}/upload-and-process`, {
      imageBase64,
      sourceType,
      category,
    });

    return ocrResponse.data.data;
  } catch (error) {
    console.error('OCR upload error:', error);
    throw error;
  }
};

export const getOCRResults = async (patientId) => {
  try {
    const response = await api.get(`/ocr/${patientId}`);
    return response.data.data;
  } catch (error) {
    console.error('Get OCR results error:', error);
    throw error;
  }
};

export const reviewOCRResult = async (patientId, ocrId, linkedRecordType, linkedRecordId) => {
  try {
    const response = await api.put(`/ocr/${patientId}/${ocrId}/review`, {
      linkedRecordType,
      linkedRecordId,
    });
    return response.data.data;
  } catch (error) {
    console.error('Review OCR result error:', error);
    throw error;
  }
};
