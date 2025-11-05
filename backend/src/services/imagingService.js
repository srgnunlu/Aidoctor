const { getSupabaseAdmin } = require('../config/supabase');

const getAllImagingResults = async (patientId, userId) => {
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

  // Get imaging results
  const { data: imagingResults, error } = await supabase
    .from('imaging_results')
    .select('*')
    .eq('patient_id', patientId)
    .order('ordered_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch imaging results: ${error.message}`);
  }

  return imagingResults || [];
};

const createImagingResult = async (patientId, userId, imagingData) => {
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

  const imagingResult = {
    patient_id: patientId,
    imaging_type: imagingData.imagingType,
    body_part: imagingData.bodyPart || null,
    findings: imagingData.findings || null,
    image_url: imagingData.imageUrl || null,
    status: imagingData.status || 'PENDING',
    ordered_at: imagingData.orderedAt || new Date().toISOString(),
    completed_at: imagingData.completedAt || null
  };

  const { data: newImagingResult, error } = await supabase
    .from('imaging_results')
    .insert(imagingResult)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create imaging result: ${error.message}`);
  }

  return newImagingResult;
};

const updateImagingStatus = async (imagingId, patientId, userId, status) => {
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

  // Verify imaging result belongs to patient
  const { data: existingImaging, error: imagingError } = await supabase
    .from('imaging_results')
    .select('patient_id')
    .eq('id', imagingId)
    .single();

  if (imagingError || !existingImaging || existingImaging.patient_id !== patientId) {
    throw new Error('Imaging result not found');
  }

  const updateData = {
    status: status
  };

  if (status === 'COMPLETED') {
    updateData.completed_at = new Date().toISOString();
  }

  const { data: updatedImaging, error } = await supabase
    .from('imaging_results')
    .update(updateData)
    .eq('id', imagingId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update imaging status: ${error.message}`);
  }

  return updatedImaging;
};

const deleteImagingResult = async (imagingId, patientId, userId) => {
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

  // Verify imaging result belongs to patient
  const { data: existingImaging, error: imagingError } = await supabase
    .from('imaging_results')
    .select('patient_id')
    .eq('id', imagingId)
    .single();

  if (imagingError || !existingImaging || existingImaging.patient_id !== patientId) {
    throw new Error('Imaging result not found');
  }

  const { error } = await supabase
    .from('imaging_results')
    .delete()
    .eq('id', imagingId);

  if (error) {
    throw new Error(`Failed to delete imaging result: ${error.message}`);
  }

  return { success: true };
};

module.exports = {
  getAllImagingResults,
  createImagingResult,
  updateImagingStatus,
  deleteImagingResult,
};