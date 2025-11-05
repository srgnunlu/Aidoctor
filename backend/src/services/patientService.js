const { getSupabaseAdmin } = require('../config/supabase');
const { FREE_PATIENT_LIMIT } = require('../config/constants');

const getPatients = async (userId, includeInactive = false) => {
  const supabase = getSupabaseAdmin();
  
  let query = supabase
    .from('patients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data: patients, error } = await query;
  
  if (error) {
    throw new Error(`Failed to fetch patients: ${error.message}`);
  }

  return patients || [];
};

const getPatientById = async (patientId, userId) => {
  const supabase = getSupabaseAdmin();
  
  // Get patient basic info
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();

  if (patientError || !patientData) {
    return null;
  }

  // Check if patient belongs to user
  if (patientData.user_id !== userId) {
    return null;
  }

  // Get vital signs
  const { data: vitalSigns, error: vitalError } = await supabase
    .from('vital_signs')
    .select('*')
    .eq('patient_id', patientId)
    .order('recorded_at', { ascending: false })
    .limit(5);

  // Get medical history
  const { data: medicalHistoryData, error: historyError } = await supabase
    .from('medical_history')
    .select('*')
    .eq('patient_id', patientId)
    .single();

  // Get lab results
  const { data: labResults, error: labError } = await supabase
    .from('lab_results')
    .select('*')
    .eq('patient_id', patientId)
    .order('ordered_at', { ascending: false })
    .limit(10);

  // Get imaging results
  const { data: imagingResults, error: imagingError } = await supabase
    .from('imaging_results')
    .select('*')
    .eq('patient_id', patientId)
    .order('ordered_at', { ascending: false })
    .limit(10);

  return {
    ...patientData,
    vitalSigns: vitalSigns || [],
    medicalHistory: medicalHistoryData || null,
    labResults: labResults || [],
    imagingResults: imagingResults || [],
  };
};

const createPatient = async (userId, patientData) => {
  const supabase = getSupabaseAdmin();
  
  // Get user data to check limits
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('subscription_type')
    .eq('id', userId)
    .single();
  
  if (userError || !userData) {
    throw new Error('User not found');
  }

  // Check patient limit for FREE tier
  if (userData.subscription_type === 'FREE') {
    const { count, error: countError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (countError) {
      throw new Error(`Failed to check patient count: ${countError.message}`);
    }

    if (count >= FREE_PATIENT_LIMIT) {
      throw new Error(`Patient limit reached. Free tier allows maximum ${FREE_PATIENT_LIMIT} active patients.`);
    }
  }

  // Create patient
  const newPatient = {
    user_id: userId,
    name: patientData.name,
    tc_no: patientData.tcNo || null,
    age: patientData.age || null,
    gender: patientData.gender || null,
    phone: patientData.phone || null,
    admission_date: patientData.admissionDate || new Date().toISOString(),
    complaint: patientData.complaint || null,
    is_active: true,
  };

  const { data: patient, error } = await supabase
    .from('patients')
    .insert(newPatient)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create patient: ${error.message}`);
  }

  return patient;
};

const updatePatient = async (patientId, userId, updateData) => {
  const supabase = getSupabaseAdmin();
  
  // Verify patient belongs to user
  const { data: existingPatient, error: checkError } = await supabase
    .from('patients')
    .select('user_id')
    .eq('id', patientId)
    .single();

  if (checkError || !existingPatient) {
    throw new Error('Patient not found');
  }

  if (existingPatient.user_id !== userId) {
    throw new Error('Access denied');
  }

  // Prepare update data
  const updatedFields = {};
  
  if (updateData.name) updatedFields.name = updateData.name;
  if (updateData.tcNo !== undefined) updatedFields.tc_no = updateData.tcNo;
  if (updateData.age !== undefined) updatedFields.age = updateData.age;
  if (updateData.gender !== undefined) updatedFields.gender = updateData.gender;
  if (updateData.phone !== undefined) updatedFields.phone = updateData.phone;
  if (updateData.complaint !== undefined) updatedFields.complaint = updateData.complaint;
  if (updateData.admissionDate !== undefined) updatedFields.admission_date = updateData.admissionDate;
  if (updateData.isActive !== undefined) updatedFields.is_active = updateData.isActive;

  // Update patient
  const { data: patient, error } = await supabase
    .from('patients')
    .update(updatedFields)
    .eq('id', patientId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update patient: ${error.message}`);
  }

  return patient;
};

const deletePatient = async (patientId, userId) => {
  const supabase = getSupabaseAdmin();
  
  // Verify patient belongs to user
  const { data: existingPatient, error: checkError } = await supabase
    .from('patients')
    .select('user_id')
    .eq('id', patientId)
    .single();

  if (checkError || !existingPatient) {
    throw new Error('Patient not found');
  }

  if (existingPatient.user_id !== userId) {
    throw new Error('Access denied');
  }

  // Soft delete (mark as inactive)
  const { error } = await supabase
    .from('patients')
    .update({ is_active: false })
    .eq('id', patientId);

  if (error) {
    throw new Error(`Failed to delete patient: ${error.message}`);
  }

  return { success: true };
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};