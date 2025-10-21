const ocrService = require('../services/ocrService');
const { ObjectStorageService } = require('../services/objectStorageService');
const { getFirestore } = require('../config/firebase');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

const uploadAndProcessOCR = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { patientId } = req.params;
    const { imageBase64, sourceType, category } = req.body;

    if (!imageBase64) {
      return errorResponse(res, 400, 'Image data is required');
    }

    if (!sourceType) {
      return errorResponse(res, 400, 'Source type is required');
    }

    const db = getFirestore();
    const patientDoc = await db.collection('patients').doc(patientId).get();

    if (!patientDoc.exists || patientDoc.data().userId !== userId || !patientDoc.data().isActive) {
      return errorResponse(res, 404, 'Patient not found or access denied');
    }

    let imageBuffer;
    try {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
    } catch (error) {
      return errorResponse(res, 400, 'Invalid image data');
    }

    const objectStorageService = new ObjectStorageService();
    const uploadResult = await objectStorageService.uploadImage(imageBuffer, 'jpg');

    const ocrResult = await ocrService.extractTextFromImage(imageBuffer);

    let structuredData = null;
    if (category === 'LAB_REPORT') {
      structuredData = await ocrService.extractStructuredLabData(ocrResult.fullText);
    } else if (category === 'IMAGING_REPORT') {
      structuredData = await ocrService.extractStructuredImagingData(ocrResult.fullText);
    }

    const fileMetadata = {
      patientId,
      userId,
      fileName: `ocr_${Date.now()}.jpg`,
      fileType: 'image',
      fileSize: imageBuffer.length,
      mimeType: 'image/jpeg',
      objectPath: uploadResult.key,
      category: category || 'OTHER',
      createdAt: new Date().toISOString()
    };

    const fileRef = await db.collection('patients').doc(patientId)
      .collection('fileMetadata')
      .add(fileMetadata);

    const ocrRecord = {
      patientId,
      userId,
      fileMetadataId: fileRef.id,
      sourceType: sourceType || 'GALLERY_UPLOAD',
      extractedText: ocrResult.fullText,
      confidence: ocrResult.confidence,
      structuredData: structuredData || null,
      isReviewed: false,
      createdAt: new Date().toISOString()
    };

    const ocrRef = await db.collection('patients').doc(patientId)
      .collection('ocrResults')
      .add(ocrRecord);

    logger.info('OCR processing completed', {
      ocrId: ocrRef.id,
      patientId,
      userId,
      textLength: ocrResult.fullText.length,
      confidence: ocrResult.confidence,
    });

    return successResponse(res, 201, 'OCR processing completed successfully', {
      ocrResult: { id: ocrRef.id, ...ocrRecord },
      fileMetadata: { id: fileRef.id, ...fileMetadata },
      extractedText: ocrResult.fullText,
      structuredData,
      confidence: ocrResult.confidence,
    });
  } catch (error) {
    logger.error('OCR processing error', { error: error.message, stack: error.stack });
    return errorResponse(res, 500, `OCR processing failed: ${error.message}`);
  }
};

const processImageOCR = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { patientId } = req.params;
    const { imageUrl, sourceType, category } = req.body;

    if (!imageUrl) {
      return errorResponse(res, 400, 'Image URL is required');
    }

    if (!sourceType) {
      return errorResponse(res, 400, 'Source type is required');
    }

    const db = getFirestore();
    const patientDoc = await db.collection('patients').doc(patientId).get();

    if (!patientDoc.exists || patientDoc.data().userId !== userId || !patientDoc.data().isActive) {
      return errorResponse(res, 404, 'Patient not found or access denied');
    }

    const objectStorageService = new ObjectStorageService();
    
    let imageBuffer;
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(imageUrl);
      imageBuffer = await objectStorageService.getObjectBuffer(objectFile);
    } catch (error) {
      return errorResponse(res, 400, `Failed to retrieve image: ${error.message}`);
    }

    const ocrResult = await ocrService.extractTextFromImage(imageBuffer);

    let structuredData = null;
    if (category === 'LAB_REPORT') {
      structuredData = await ocrService.extractStructuredLabData(ocrResult.fullText);
    } else if (category === 'IMAGING_REPORT') {
      structuredData = await ocrService.extractStructuredImagingData(ocrResult.fullText);
    }

    const fileMetadata = {
      patientId,
      userId,
      fileName: `ocr_${Date.now()}.jpg`,
      fileType: 'image',
      fileSize: imageBuffer.length,
      mimeType: 'image/jpeg',
      objectPath: imageUrl,
      category: category || 'OTHER',
      createdAt: new Date().toISOString()
    };

    const fileRef = await db.collection('patients').doc(patientId)
      .collection('fileMetadata')
      .add(fileMetadata);

    const ocrRecord = {
      patientId,
      userId,
      fileMetadataId: fileRef.id,
      sourceType: sourceType || 'GALLERY_UPLOAD',
      extractedText: ocrResult.fullText,
      confidence: ocrResult.confidence,
      structuredData: structuredData || null,
      isReviewed: false,
      createdAt: new Date().toISOString()
    };

    const ocrRef = await db.collection('patients').doc(patientId)
      .collection('ocrResults')
      .add(ocrRecord);

    logger.info('OCR processing completed', {
      ocrId: ocrRef.id,
      patientId,
      userId,
      textLength: ocrResult.fullText.length,
      confidence: ocrResult.confidence,
    });

    return successResponse(res, 201, 'OCR processing completed successfully', {
      ocrResult: { id: ocrRef.id, ...ocrRecord },
      fileMetadata: { id: fileRef.id, ...fileMetadata },
      extractedText: ocrResult.fullText,
      structuredData,
      confidence: ocrResult.confidence,
    });
  } catch (error) {
    logger.error('OCR processing error', { error: error.message, stack: error.stack });
    return errorResponse(res, 500, `OCR processing failed: ${error.message}`);
  }
};

const getOCRResults = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { patientId } = req.params;

    const db = getFirestore();
    const patientDoc = await db.collection('patients').doc(patientId).get();

    if (!patientDoc.exists || patientDoc.data().userId !== userId || !patientDoc.data().isActive) {
      return errorResponse(res, 404, 'Patient not found or access denied');
    }

    const ocrSnapshot = await db.collection('patients').doc(patientId)
      .collection('ocrResults')
      .orderBy('createdAt', 'desc')
      .get();

    const ocrResults = [];
    for (const doc of ocrSnapshot.docs) {
      const ocrData = doc.data();
      
      let fileMetadata = null;
      if (ocrData.fileMetadataId) {
        const fileDoc = await db.collection('patients').doc(patientId)
          .collection('fileMetadata')
          .doc(ocrData.fileMetadataId)
          .get();
        
        if (fileDoc.exists) {
          fileMetadata = { id: fileDoc.id, ...fileDoc.data() };
        }
      }

      ocrResults.push({
        id: doc.id,
        ...ocrData,
        fileMetadata
      });
    }

    logger.info('OCR results retrieved', { patientId, userId, count: ocrResults.length });
    return successResponse(res, 200, 'OCR results retrieved successfully', ocrResults);
  } catch (error) {
    logger.error('Error retrieving OCR results', { error: error.message });
    return errorResponse(res, 500, error.message);
  }
};

const reviewOCRResult = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { patientId, ocrId } = req.params;
    const { linkedRecordType, linkedRecordId } = req.body;

    const db = getFirestore();
    const patientDoc = await db.collection('patients').doc(patientId).get();

    if (!patientDoc.exists || patientDoc.data().userId !== userId || !patientDoc.data().isActive) {
      return errorResponse(res, 404, 'Patient not found or access denied');
    }

    const ocrRef = db.collection('patients').doc(patientId).collection('ocrResults').doc(ocrId);
    const ocrDoc = await ocrRef.get();

    if (!ocrDoc.exists) {
      return errorResponse(res, 404, 'OCR result not found');
    }

    await ocrRef.update({
      isReviewed: true,
      reviewedBy: userId,
      reviewedAt: new Date().toISOString(),
      linkedRecordType: linkedRecordType || null,
      linkedRecordId: linkedRecordId || null,
    });

    const updatedDoc = await ocrRef.get();

    logger.info('OCR result reviewed', { ocrId, patientId, userId });
    return successResponse(res, 200, 'OCR result reviewed successfully', {
      id: ocrId,
      ...updatedDoc.data()
    });
  } catch (error) {
    logger.error('Error reviewing OCR result', { error: error.message });
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  uploadAndProcessOCR,
  processImageOCR,
  getOCRResults,
  reviewOCRResult,
};
