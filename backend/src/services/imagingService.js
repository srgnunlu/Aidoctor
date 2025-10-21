const { getFirestore } = require('../config/firebase');

const getAllImagingResults = async (patientId, userId) => {
  const db = getFirestore();
  const patientDoc = await db.collection('patients').doc(patientId).get();

  if (!patientDoc.exists || patientDoc.data().userId !== userId || !patientDoc.data().isActive) {
    throw new Error('Patient not found or access denied');
  }

  const imagingSnapshot = await db.collection('patients').doc(patientId)
    .collection('imagingResults')
    .orderBy('orderedAt', 'desc')
    .get();

  const imagingResults = [];
  imagingSnapshot.forEach(doc => {
    imagingResults.push({
      id: doc.id,
      ...doc.data()
    });
  });

  return imagingResults;
};

const createImagingResult = async (patientId, userId, imagingData) => {
  const db = getFirestore();
  const patientDoc = await db.collection('patients').doc(patientId).get();

  if (!patientDoc.exists || patientDoc.data().userId !== userId || !patientDoc.data().isActive) {
    throw new Error('Patient not found or access denied');
  }

  const imagingResult = {
    imagingType: imagingData.imagingType,
    bodyPart: imagingData.bodyPart,
    findings: imagingData.findings ?? null,
    imageUrl: imagingData.imageUrl ?? null,
    status: imagingData.status ?? 'PENDING',
    orderedAt: imagingData.orderedAt ?? new Date().toISOString(),
    completedAt: imagingData.completedAt ?? null
  };

  const docRef = await db.collection('patients').doc(patientId)
    .collection('imagingResults')
    .add(imagingResult);

  return {
    id: docRef.id,
    ...imagingResult
  };
};

module.exports = {
  getAllImagingResults,
  createImagingResult
};
