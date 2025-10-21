const { getFirestore } = require('../config/firebase');
const { FREE_PATIENT_LIMIT } = require('../config/constants');

const getPatients = async (userId, includeInactive = false) => {
  const db = getFirestore();
  const patientsRef = db.collection('patients');
  
  let query = patientsRef.where('userId', '==', userId);
  
  if (!includeInactive) {
    query = query.where('isActive', '==', true);
  }

  const snapshot = await query.orderBy('createdAt', 'desc').get();
  
  const patients = [];
  snapshot.forEach(doc => {
    patients.push({
      id: doc.id,
      ...doc.data()
    });
  });

  return patients;
};

const getPatientById = async (patientId, userId) => {
  const db = getFirestore();
  const patientDoc = await db.collection('patients').doc(patientId).get();

  if (!patientDoc.exists) {
    return null;
  }

  const patientData = patientDoc.data();
  
  if (patientData.userId !== userId) {
    return null;
  }

  const vitalSignsSnapshot = await db.collection('patients').doc(patientId)
    .collection('vitalSigns')
    .orderBy('recordedAt', 'desc')
    .limit(5)
    .get();
  
  const vitalSigns = [];
  vitalSignsSnapshot.forEach(doc => {
    vitalSigns.push({ id: doc.id, ...doc.data() });
  });

  const medicalHistoryDoc = await db.collection('patients').doc(patientId)
    .collection('medicalHistory')
    .doc('current')
    .get();
  
  const medicalHistory = medicalHistoryDoc.exists ? { id: medicalHistoryDoc.id, ...medicalHistoryDoc.data() } : null;

  const labResultsSnapshot = await db.collection('patients').doc(patientId)
    .collection('labResults')
    .orderBy('orderedAt', 'desc')
    .limit(10)
    .get();
  
  const labResults = [];
  labResultsSnapshot.forEach(doc => {
    labResults.push({ id: doc.id, ...doc.data() });
  });

  const imagingResultsSnapshot = await db.collection('patients').doc(patientId)
    .collection('imagingResults')
    .orderBy('orderedAt', 'desc')
    .limit(10)
    .get();
  
  const imagingResults = [];
  imagingResultsSnapshot.forEach(doc => {
    imagingResults.push({ id: doc.id, ...doc.data() });
  });

  return {
    id: patientId,
    ...patientData,
    vitalSigns,
    medicalHistory,
    labResults,
    imagingResults,
  };
};

const createPatient = async (userId, patientData) => {
  const db = getFirestore();
  
  const userDoc = await db.collection('users').doc(userId).get();
  
  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const user = userDoc.data();

  if (user.subscriptionType === 'FREE') {
    const activePatientsSnapshot = await db.collection('patients')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    if (activePatientsSnapshot.size >= FREE_PATIENT_LIMIT) {
      throw new Error(`Free tier limited to ${FREE_PATIENT_LIMIT} active patients. Please upgrade to add more patients.`);
    }
  }

  const newPatient = {
    userId: userId,
    name: patientData.name,
    age: patientData.age,
    gender: patientData.gender,
    identityNumber: patientData.identityNumber || null,
    phone: patientData.phone || null,
    complaint: patientData.complaint,
    status: patientData.status || 'EVALUATION',
    priority: patientData.priority || 'MEDIUM',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await db.collection('patients').add(newPatient);

  return {
    id: docRef.id,
    ...newPatient,
  };
};

const updatePatient = async (patientId, userId, updateData) => {
  const db = getFirestore();
  const patientRef = db.collection('patients').doc(patientId);
  const patientDoc = await patientRef.get();

  if (!patientDoc.exists) {
    throw new Error('Patient not found or access denied');
  }

  const patientData = patientDoc.data();
  
  if (patientData.userId !== userId) {
    throw new Error('Patient not found or access denied');
  }

  const updates = {
    ...updateData,
    updatedAt: new Date().toISOString(),
  };

  await patientRef.update(updates);

  const updatedDoc = await patientRef.get();

  return {
    id: patientId,
    ...updatedDoc.data(),
  };
};

const deletePatient = async (patientId, userId) => {
  const db = getFirestore();
  const patientRef = db.collection('patients').doc(patientId);
  const patientDoc = await patientRef.get();

  if (!patientDoc.exists) {
    throw new Error('Patient not found or access denied');
  }

  const patientData = patientDoc.data();
  
  if (patientData.userId !== userId) {
    throw new Error('Patient not found or access denied');
  }

  await patientRef.update({
    isActive: false,
    updatedAt: new Date().toISOString(),
  });

  return {
    id: patientId,
    ...patientData,
    isActive: false,
  };
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};
