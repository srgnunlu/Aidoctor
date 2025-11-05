const { getSupabaseAdmin } = require('../config/supabase');
const { getParameterStatus, getParameterInfo } = require('../utils/labReferenceRanges');

const getAllLabResults = async (patientId, userId) => {
  const supabase = getSupabaseAdmin();
  
  // Verify patient belongs to user
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('user_id, is_active')
    .eq('id', patientId)
    .single();

  if (patientError || !patientData || patientData.user_id !== userId || !patientData.is_active) {
    throw new Error('Patient not found or access denied');
  }

  // Get lab results
  const { data: labResults, error } = await supabase
    .from('lab_results')
    .select('*')
    .eq('patient_id', patientId)
    .order('ordered_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch lab results: ${error.message}`);
  }

  return labResults || [];
};

const createLabResult = async (patientId, userId, labData) => {
  const supabase = getSupabaseAdmin();
  
  // Verify patient belongs to user
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('user_id, is_active')
    .eq('id', patientId)
    .single();

  if (patientError || !patientData || patientData.user_id !== userId || !patientData.is_active) {
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
    patient_id: patientId,
    test_name: labData.testName,
    test_type: labData.testType,
    category: labData.category || 'BIOCHEMISTRY',
    results: labData.results || {},
    parameters: parameters,
    status: labData.status || 'PENDING',
    notes: labData.notes || null,
    ordered_at: labData.orderedAt || now,
    resulted_at: labData.resultedAt || (labData.status === 'COMPLETED' ? now : null)
  };

  const { data: newLabResult, error } = await supabase
    .from('lab_results')
    .insert(labResult)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create lab result: ${error.message}`);
  }

  return newLabResult;
};

const updateLabStatus = async (labId, patientId, userId, status) => {
  const supabase = getSupabaseAdmin();
  
  // Verify patient belongs to user
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('user_id, is_active')
    .eq('id', patientId)
    .single();

  if (patientError || !patientData || patientData.user_id !== userId || !patientData.is_active) {
    throw new Error('Patient not found or access denied');
  }

  // Verify lab result belongs to patient
  const { data: existingLab, error: labError } = await supabase
    .from('lab_results')
    .select('patient_id')
    .eq('id', labId)
    .single();

  if (labError || !existingLab || existingLab.patient_id !== patientId) {
    throw new Error('Lab result not found');
  }

  const updateData = {
    status: status
  };

  if (status === 'COMPLETED') {
    updateData.resulted_at = new Date().toISOString();
  }

  const { data: updatedLab, error } = await supabase
    .from('lab_results')
    .update(updateData)
    .eq('id', labId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update lab status: ${error.message}`);
  }

  return updatedLab;
};

const deleteLabResult = async (labId, patientId, userId) => {
  const supabase = getSupabaseAdmin();
  
  // Verify patient belongs to user
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('user_id, is_active')
    .eq('id', patientId)
    .single();

  if (patientError || !patientData || patientData.user_id !== userId || !patientData.is_active) {
    throw new Error('Patient not found or access denied');
  }

  // Verify lab result belongs to patient
  const { data: existingLab, error: labError } = await supabase
    .from('lab_results')
    .select('patient_id')
    .eq('id', labId)
    .single();

  if (labError || !existingLab || existingLab.patient_id !== patientId) {
    throw new Error('Lab result not found');
  }

  const { error } = await supabase
    .from('lab_results')
    .delete()
    .eq('id', labId);

  if (error) {
    throw new Error(`Failed to delete lab result: ${error.message}`);
  }

  return { success: true };
};

module.exports = {
  getAllLabResults,
  createLabResult,
  updateLabStatus,
  deleteLabResult,
};