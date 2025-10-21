const { getFirestore } = require('../config/firebase');

const getVitalSigns = async (patientId, userId) => {
  const db = getFirestore();
  const patientDoc = await db.collection('patients').doc(patientId).get();

  if (!patientDoc.exists || patientDoc.data().userId !== userId) {
    throw new Error('Patient not found or access denied');
  }

  const vitalsSnapshot = await db.collection('patients').doc(patientId)
    .collection('vitalSigns')
    .orderBy('recordedAt', 'desc')
    .get();

  const vitals = [];
  vitalsSnapshot.forEach(doc => {
    vitals.push({
      id: doc.id,
      ...doc.data()
    });
  });

  return vitals;
};

const getVitalSignById = async (vitalId, patientId, userId) => {
  const db = getFirestore();
  const patientDoc = await db.collection('patients').doc(patientId).get();

  if (!patientDoc.exists || patientDoc.data().userId !== userId) {
    throw new Error('Patient not found or access denied');
  }

  const vitalDoc = await db.collection('patients').doc(patientId)
    .collection('vitalSigns')
    .doc(vitalId)
    .get();

  if (!vitalDoc.exists) {
    return null;
  }

  return {
    id: vitalDoc.id,
    ...vitalDoc.data()
  };
};

const createVitalSign = async (patientId, userId, vitalData) => {
  const db = getFirestore();
  const patientDoc = await db.collection('patients').doc(patientId).get();

  if (!patientDoc.exists || patientDoc.data().userId !== userId) {
    throw new Error('Patient not found or access denied');
  }

  const vital = {
    bloodPressureSystolic: vitalData.bloodPressureSystolic ?? null,
    bloodPressureDiastolic: vitalData.bloodPressureDiastolic ?? null,
    heartRate: vitalData.heartRate ?? null,
    temperature: vitalData.temperature ?? null,
    oxygenSaturation: vitalData.oxygenSaturation ?? null,
    respiratoryRate: vitalData.respiratoryRate ?? null,
    consciousness: vitalData.consciousness ?? null,
    recordedAt: vitalData.recordedAt ?? new Date().toISOString()
  };

  const docRef = await db.collection('patients').doc(patientId)
    .collection('vitalSigns')
    .add(vital);

  return {
    id: docRef.id,
    ...vital
  };
};

module.exports = {
  getVitalSigns,
  getVitalSignById,
  createVitalSign
};
