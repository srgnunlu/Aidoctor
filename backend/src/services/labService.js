const { getFirestore } = require('../config/firebase');
const { getParameterStatus, getParameterInfo } = require('../utils/labReferenceRanges');

const getAllLabResults = async (patientId, userId) => {
  const db = getFirestore();
  const patientDoc = await db.collection('patients').doc(patientId).get();

  if (!patientDoc.exists || patientDoc.data().userId !== userId || !patientDoc.data().isActive) {
    throw new Error('Patient not found or access denied');
  }

  const labResultsSnapshot = await db.collection('patients').doc(patientId)
    .collection('labResults')
    .orderBy('orderedAt', 'desc')
    .get();

  const labResults = [];
  labResultsSnapshot.forEach(doc => {
    labResults.push({
      id: doc.id,
      ...doc.data()
    });
  });

  return labResults;
};

const createLabResult = async (patientId, userId, labData) => {
  const db = getFirestore();
  const patientDoc = await db.collection('patients').doc(patientId).get();

  if (!patientDoc.exists || patientDoc.data().userId !== userId || !patientDoc.data().isActive) {
    throw new Error('Patient not found or access denied');
  }

  const now = new Date().toISOString();

  let parameters = [];
  
  if (labData.parameters && Array.isArray(labData.parameters)) {
    parameters = labData.parameters.map(param => {
      const status = getParameterStatus(param.key, param.value, labData.category);
      const paramInfo = getParameterInfo(param.key, labData.category);
      
      return {
        key: param.key,
        name: param.name || (paramInfo ? paramInfo.name : param.key),
        value: param.value,
        unit: param.unit || (paramInfo ? paramInfo.unit : ''),
        refMin: param.refMin ?? (paramInfo ? paramInfo.refMin : null),
        refMax: param.refMax ?? (paramInfo ? paramInfo.refMax : null),
        status: status
      };
    });
  }

  const labResult = {
    testName: labData.testName,
    testType: labData.testType,
    category: labData.category || 'BIOCHEMISTRY',
    results: labData.results ?? {},
    parameters: parameters,
    status: labData.status ?? 'PENDING',
    notes: labData.notes ?? null,
    orderedAt: labData.orderedAt ?? now,
    resultedAt: labData.resultedAt ?? (labData.status === 'COMPLETED' ? now : null)
  };

  const docRef = await db.collection('patients').doc(patientId)
    .collection('labResults')
    .add(labResult);

  return {
    id: docRef.id,
    ...labResult
  };
};

const updateLabStatus = async (labId, patientId, userId, status) => {
  const db = getFirestore();
  const patientDoc = await db.collection('patients').doc(patientId).get();

  if (!patientDoc.exists || patientDoc.data().userId !== userId || !patientDoc.data().isActive) {
    throw new Error('Patient not found or access denied');
  }

  const labRef = db.collection('patients').doc(patientId).collection('labResults').doc(labId);
  const labDoc = await labRef.get();

  if (!labDoc.exists) {
    throw new Error('Lab result not found');
  }

  const updateData = {
    status: status
  };

  if (status === 'COMPLETED' && !labDoc.data().resultedAt) {
    updateData.resultedAt = new Date().toISOString();
  }

  await labRef.update(updateData);

  const updatedDoc = await labRef.get();

  return {
    id: labId,
    ...updatedDoc.data()
  };
};

const updateLabResult = async (labId, patientId, userId, updateData) => {
  const db = getFirestore();
  const patientDoc = await db.collection('patients').doc(patientId).get();

  if (!patientDoc.exists || patientDoc.data().userId !== userId || !patientDoc.data().isActive) {
    throw new Error('Patient not found or access denied');
  }

  const labRef = db.collection('patients').doc(patientId).collection('labResults').doc(labId);
  const labDoc = await labRef.get();

  if (!labDoc.exists) {
    throw new Error('Lab result not found');
  }

  const updates = {};

  if (updateData.parameters && Array.isArray(updateData.parameters)) {
    const category = updateData.category || labDoc.data().category || 'BIOCHEMISTRY';
    updates.parameters = updateData.parameters.map(param => {
      const status = getParameterStatus(param.key, param.value, category);
      const paramInfo = getParameterInfo(param.key, category);
      
      return {
        key: param.key,
        name: param.name || (paramInfo ? paramInfo.name : param.key),
        value: param.value,
        unit: param.unit || (paramInfo ? paramInfo.unit : ''),
        refMin: param.refMin ?? (paramInfo ? paramInfo.refMin : null),
        refMax: param.refMax ?? (paramInfo ? paramInfo.refMax : null),
        status: status
      };
    });
  }

  if (updateData.status) updates.status = updateData.status;
  if (updateData.notes !== undefined) updates.notes = updateData.notes;
  if (updateData.category) updates.category = updateData.category;
  if (updateData.testName) updates.testName = updateData.testName;

  if (updateData.status === 'COMPLETED' && !labDoc.data().resultedAt) {
    updates.resultedAt = new Date().toISOString();
  }

  await labRef.update(updates);

  const updatedDoc = await labRef.get();

  return {
    id: labId,
    ...updatedDoc.data()
  };
};

module.exports = {
  getAllLabResults,
  createLabResult,
  updateLabStatus,
  updateLabResult
};
