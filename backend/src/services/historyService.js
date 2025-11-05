const { getSupabaseAdmin } = require('../config/supabase');

const getMedicalHistory = async (patientId, userId) => {
  const supabase = getSupabaseAdmin();
  
  // Verify patient belongs to user
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('user_id')
    .eq('id', patientId)
    .single();

  if (patientError || !patientData || patientData.user_id !== userId) {
    throw new Error('Patient not found or access denied');
  }

  // Get medical history
  const { data: history, error } = await supabase
    .from('medical_history')
    .select('*')
    .eq('patient_id', patientId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
    throw new Error(`Failed to fetch medical history: ${error.message}`);
  }

  return history || null;
};

const createMedicalHistory = async (patientId, userId, historyData) => {
  const supabase = getSupabaseAdmin();
  
  // Verify patient belongs to user
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('user_id')
    .eq('id', patientId)
    .single();

  if (patientError || !patientData || patientData.user_id !== userId) {
    throw new Error('Patient not found or access denied');
  }

  // Check if medical history already exists
  const { data: existingHistory, error: checkError } = await supabase
    .from('medical_history')
    .select('id')
    .eq('patient_id', patientId)
    .single();

  if (existingHistory) {
    throw new Error('Medical history already exists for this patient. Use update instead.');
  }

  const history = {
    patient_id: patientId,
    complaint_history: historyData.complaintHistory || null,
    medical_history: historyData.medicalHistory || null,
    surgical_history: historyData.surgicalHistory || null,
    family_history: historyData.familyHistory || null,
    allergies: historyData.allergies || null,
    current_medications: historyData.currentMedications || null,
    smoking: historyData.smoking || false,
    alcohol: historyData.alcohol || false,
  };

  const { data: newHistory, error } = await supabase
    .from('medical_history')
    .insert(history)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create medical history: ${error.message}`);
  }

  return newHistory;
};

const updateMedicalHistory = async (historyId, patientId, userId, updateData) => {
  const supabase = getSupabaseAdmin();
  
  // Verify patient belongs to user
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('user_id')
    .eq('id', patientId)
    .single();

  if (patientError || !patientData || patientData.user_id !== userId) {
    throw new Error('Patient not found or access denied');
  }

  // Verify medical history exists for this patient
  const { data: existingHistory, error: historyError } = await supabase
    .from('medical_history')
    .select('patient_id')
    .eq('id', historyId)
    .single();

  if (historyError || !existingHistory || existingHistory.patient_id !== patientId) {
    throw new Error('Medical history not found');
  }

  const updatedFields = {};
  
  if (updateData.complaintHistory !== undefined) 
    updatedFields.complaint_history = updateData.complaintHistory;
  if (updateData.medicalHistory !== undefined) 
    updatedFields.medical_history = updateData.medicalHistory;
  if (updateData.surgicalHistory !== undefined) 
    updatedFields.surgical_history = updateData.surgicalHistory;
  if (updateData.familyHistory !== undefined) 
    updatedFields.family_history = updateData.familyHistory;
  if (updateData.allergies !== undefined) 
    updatedFields.allergies = updateData.allergies;
  if (updateData.currentMedications !== undefined) 
    updatedFields.current_medications = updateData.currentMedications;
  if (updateData.smoking !== undefined) 
    updatedFields.smoking = updateData.smoking;
  if (updateData.alcohol !== undefined) 
    updatedFields.alcohol = updateData.alcohol;

  const { data: history, error } = await supabase
    .from('medical_history')
    .update(updatedFields)
    .eq('id', historyId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update medical history: ${error.message}`);
  }

  return history;
};

const deleteMedicalHistory = async (historyId, patientId, userId) => {
  const supabase = getSupabaseAdmin();
  
  // Verify patient belongs to user
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('user_id')
    .eq('id', patientId)
    .single();

  if (patientError || !patientData || patientData.user_id !== userId) {
    throw new Error('Patient not found or access denied');
  }

  // Verify medical history belongs to patient
  const { data: existingHistory, error: historyError } = await supabase
    .from('medical_history')
    .select('patient_id')
    .eq('id', historyId)
    .single();

  if (historyError || !existingHistory || existingHistory.patient_id !== patientId) {
    throw new Error('Medical history not found');
  }

  const { error } = await supabase
    .from('medical_history')
    .delete()
    .eq('id', historyId);

  if (error) {
    throw new Error(`Failed to delete medical history: ${error.message}`);
  }

  return { success: true };
};

module.exports = {
  getMedicalHistory,
  createMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
};