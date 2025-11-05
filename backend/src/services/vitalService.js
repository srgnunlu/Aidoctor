const { getSupabaseAdmin } = require('../config/supabase');

const getVitalSigns = async (patientId, userId) => {
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

  // Get vital signs
  const { data: vitals, error } = await supabase
    .from('vital_signs')
    .select('*')
    .eq('patient_id', patientId)
    .order('recorded_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch vital signs: ${error.message}`);
  }

  return vitals || [];
};

const getVitalSignById = async (vitalId, patientId, userId) => {
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

  // Get vital sign
  const { data: vital, error } = await supabase
    .from('vital_signs')
    .select('*')
    .eq('id', vitalId)
    .eq('patient_id', patientId)
    .single();

  if (error || !vital) {
    return null;
  }

  return vital;
};

const createVitalSign = async (patientId, userId, vitalData) => {
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

  const vital = {
    patient_id: patientId,
    blood_pressure_systolic: vitalData.bloodPressureSystolic ?? null,
    blood_pressure_diastolic: vitalData.bloodPressureDiastolic ?? null,
    heart_rate: vitalData.heartRate ?? null,
    respiratory_rate: vitalData.respiratoryRate ?? null,
    temperature: vitalData.temperature ?? null,
    oxygen_saturation: vitalData.oxygenSaturation ?? null,
    consciousness_level: vitalData.consciousnessLevel ?? null,
    notes: vitalData.notes ?? null,
    recorded_at: vitalData.recordedAt || new Date().toISOString(),
  };

  const { data: newVital, error } = await supabase
    .from('vital_signs')
    .insert(vital)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create vital sign: ${error.message}`);
  }

  return newVital;
};

const updateVitalSign = async (vitalId, patientId, userId, updateData) => {
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

  // Verify vital sign belongs to patient
  const { data: existingVital, error: vitalError } = await supabase
    .from('vital_signs')
    .select('patient_id')
    .eq('id', vitalId)
    .single();

  if (vitalError || !existingVital || existingVital.patient_id !== patientId) {
    throw new Error('Vital sign not found');
  }

  const updatedFields = {};
  
  if (updateData.bloodPressureSystolic !== undefined) 
    updatedFields.blood_pressure_systolic = updateData.bloodPressureSystolic;
  if (updateData.bloodPressureDiastolic !== undefined) 
    updatedFields.blood_pressure_diastolic = updateData.bloodPressureDiastolic;
  if (updateData.heartRate !== undefined) 
    updatedFields.heart_rate = updateData.heartRate;
  if (updateData.respiratoryRate !== undefined) 
    updatedFields.respiratory_rate = updateData.respiratoryRate;
  if (updateData.temperature !== undefined) 
    updatedFields.temperature = updateData.temperature;
  if (updateData.oxygenSaturation !== undefined) 
    updatedFields.oxygen_saturation = updateData.oxygenSaturation;
  if (updateData.consciousnessLevel !== undefined) 
    updatedFields.consciousness_level = updateData.consciousnessLevel;
  if (updateData.notes !== undefined) 
    updatedFields.notes = updateData.notes;
  if (updateData.recordedAt !== undefined) 
    updatedFields.recorded_at = updateData.recordedAt;

  const { data: vital, error } = await supabase
    .from('vital_signs')
    .update(updatedFields)
    .eq('id', vitalId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update vital sign: ${error.message}`);
  }

  return vital;
};

const deleteVitalSign = async (vitalId, patientId, userId) => {
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

  // Verify vital sign belongs to patient
  const { data: existingVital, error: vitalError } = await supabase
    .from('vital_signs')
    .select('patient_id')
    .eq('id', vitalId)
    .single();

  if (vitalError || !existingVital || existingVital.patient_id !== patientId) {
    throw new Error('Vital sign not found');
  }

  const { error } = await supabase
    .from('vital_signs')
    .delete()
    .eq('id', vitalId);

  if (error) {
    throw new Error(`Failed to delete vital sign: ${error.message}`);
  }

  return { success: true };
};

module.exports = {
  getVitalSigns,
  getVitalSignById,
  createVitalSign,
  updateVitalSign,
  deleteVitalSign,
};