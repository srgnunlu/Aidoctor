const { getFirestore } = require('../config/firebase');

const getMedicalHistory = async (patientId, userId) => {
  const db = getFirestore();
  const patientDoc = await db.collection('patients').doc(patientId).get();

  if (!patientDoc.exists || patientDoc.data().userId !== userId) {
    throw new Error('Patient not found or access denied');
  }

  const historyDoc = await db.collection('patients').doc(patientId)
    .collection('medicalHistory')
    .doc('current')
    .get();

  if (!historyDoc.exists) {
    return null;
  }

  return {
    id: historyDoc.id,
    ...historyDoc.data()
  };
};

const createMedicalHistory = async (patientId, userId, historyData) => {
  const db = getFirestore();
  const patientDoc = await db.collection('patients').doc(patientId).get();

  if (!patientDoc.exists || patientDoc.data().userId !== userId) {
    throw new Error('Patient not found or access denied');
  }

  const historyRef = db.collection('patients').doc(patientId)
    .collection('medicalHistory')
    .doc('current');
  
  const existingHistory = await historyRef.get();

  if (existingHistory.exists) {
    throw new Error('Medical history already exists for this patient. Use update instead.');
  }

  const history = {
    complaintHistory: historyData.complaintHistory ?? null,
    medicalHistory: historyData.medicalHistory ?? null,
    surgicalHistory: historyData.surgicalHistory ?? null,
    familyHistory: historyData.familyHistory ?? null,
    allergies: historyData.allergies ?? null,
    currentMedications: historyData.currentMedications ?? null,
    smoking: historyData.smoking ?? false,
    alcohol: historyData.alcohol ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await historyRef.set(history);

  return {
    id: 'current',
    ...history
  };
};

const updateMedicalHistory = async (historyId, patientId, userId, updateData) => {
  const db = getFirestore();
  const patientDoc = await db.collection('patients').doc(patientId).get();

  if (!patientDoc.exists || patientDoc.data().userId !== userId) {
    throw new Error('Patient not found or access denied');
  }

  const historyRef = db.collection('patients').doc(patientId)
    .collection('medicalHistory')
    .doc('current');
  
  const existingHistory = await historyRef.get();

  if (!existingHistory.exists) {
    throw new Error('Medical history not found');
  }

  const allowedFields = [
    'complaintHistory',
    'medicalHistory',
    'surgicalHistory',
    'familyHistory',
    'allergies',
    'currentMedications',
    'smoking',
    'alcohol'
  ];

  const filteredData = {
    updatedAt: new Date().toISOString()
  };
  
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  });

  if (Object.keys(filteredData).length === 1) {
    throw new Error('No valid fields to update');
  }

  await historyRef.update(filteredData);

  const updatedDoc = await historyRef.get();

  return {
    id: 'current',
    ...updatedDoc.data()
  };
};

module.exports = {
  getMedicalHistory,
  createMedicalHistory,
  updateMedicalHistory
};
