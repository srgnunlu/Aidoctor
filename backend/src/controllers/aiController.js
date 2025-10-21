const aiService = require('../services/aiService');
const patientService = require('../services/patientService');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');
const { getFirestore } = require('../config/firebase');

const analyzePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.userId;

    const patient = await patientService.getPatientById(patientId, userId);
    
    if (!patient) {
      return errorResponse(res, 404, 'Hasta bulunamadı');
    }

    const db = getFirestore();

    const vitalsSnapshot = await db.collection('patients').doc(patientId)
      .collection('vitalSigns')
      .orderBy('recordedAt', 'desc')
      .get();
    const vitals = [];
    vitalsSnapshot.forEach(doc => vitals.push({ id: doc.id, ...doc.data() }));

    const labsSnapshot = await db.collection('patients').doc(patientId)
      .collection('labResults')
      .orderBy('orderedAt', 'desc')
      .get();
    const labs = [];
    labsSnapshot.forEach(doc => labs.push({ id: doc.id, ...doc.data() }));

    const imagingSnapshot = await db.collection('patients').doc(patientId)
      .collection('imagingResults')
      .orderBy('orderedAt', 'desc')
      .get();
    const imaging = [];
    imagingSnapshot.forEach(doc => imaging.push({ id: doc.id, ...doc.data() }));

    const medicalHistoryDoc = await db.collection('patients').doc(patientId)
      .collection('medicalHistory')
      .doc('current')
      .get();
    const medicalHistory = medicalHistoryDoc.exists ? { id: medicalHistoryDoc.id, ...medicalHistoryDoc.data() } : null;

    const patientData = {
      id: patient.id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      complaint: patient.complaint,
      vitals: vitals,
      labs: labs,
      imaging: imaging,
      medicalHistory: medicalHistory
    };

    const result = await aiService.analyzePatient(patientData);

    const aiAnalysis = {
      patientId: patient.id,
      analysisType: 'DIAGNOSIS',
      inputData: patientData,
      outputData: result.analysis,
      references: {
        model: result.model,
        tokens: result.tokens?.total_tokens || 0
      },
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('patients').doc(patientId)
      .collection('aiAnalyses')
      .add(aiAnalysis);

    logger.info(`AI analysis created for patient ${patientId} by user ${userId}`);
    
    return successResponse(res, 200, 'AI analizi başarıyla oluşturuldu', {
      id: docRef.id,
      ...aiAnalysis
    });
  } catch (error) {
    logger.error('AI analysis error:', error);
    return errorResponse(res, 500, error.message);
  }
};

const getPatientAnalyses = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.userId;

    const patient = await patientService.getPatientById(patientId, userId);
    
    if (!patient) {
      return errorResponse(res, 404, 'Hasta bulunamadı');
    }

    const db = getFirestore();
    const analysesSnapshot = await db.collection('patients').doc(patientId)
      .collection('aiAnalyses')
      .orderBy('createdAt', 'desc')
      .get();

    const analyses = [];
    analysesSnapshot.forEach(doc => {
      analyses.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return successResponse(res, 200, 'AI analizleri başarıyla alındı', analyses);
  } catch (error) {
    logger.error('Get analyses error:', error);
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  analyzePatient,
  getPatientAnalyses
};
