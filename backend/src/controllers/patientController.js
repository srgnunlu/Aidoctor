const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');
const patientService = require('../services/patientService');

const getPatients = async (req, res) => {
  try {
    const userId = req.user.userId;
    const includeInactive = req.query.includeInactive === 'true';

    const patients = await patientService.getPatients(userId, includeInactive);

    return successResponse(res, 200, 'Patients retrieved successfully', patients);

  } catch (error) {
    logger.error('Get patients error', { error: error.message });
    return errorResponse(res, 500, 'Failed to retrieve patients', error.message);
  }
};

const getPatientById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = req.params.id;

    const patient = await patientService.getPatientById(patientId, userId);

    if (!patient) {
      return errorResponse(res, 404, 'Patient not found');
    }

    return successResponse(res, 200, 'Patient retrieved successfully', patient);

  } catch (error) {
    logger.error('Get patient by ID error', { error: error.message });
    return errorResponse(res, 500, 'Failed to retrieve patient', error.message);
  }
};

const createPatient = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, age, gender, identityNumber, phone, complaint, status, priority } = req.body;

    if (!name || !age || !gender || !complaint) {
      return errorResponse(res, 400, 'Name, age, gender, and complaint are required');
    }

    if (age < 0 || age > 150) {
      return errorResponse(res, 400, 'Invalid age');
    }

    const validGenders = ['MALE', 'FEMALE', 'OTHER'];
    if (!validGenders.includes(gender)) {
      return errorResponse(res, 400, 'Invalid gender. Must be MALE, FEMALE, or OTHER');
    }

    const patient = await patientService.createPatient(userId, {
      name,
      age,
      gender,
      identityNumber,
      phone,
      complaint,
      status,
      priority
    });

    logger.info('New patient created', { patientId: patient.id, userId });

    return successResponse(res, 201, 'Patient created successfully', patient);

  } catch (error) {
    logger.error('Create patient error', { error: error.message });
    
    if (error.message.includes('limited to')) {
      return errorResponse(res, 403, error.message);
    }
    
    return errorResponse(res, 500, 'Failed to create patient', error.message);
  }
};

const updatePatient = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = req.params.id;
    
    const allowedFields = ['name', 'age', 'gender', 'identityNumber', 'phone', 'complaint', 'priority'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return errorResponse(res, 400, 'No valid fields to update');
    }

    if (updateData.age && (updateData.age < 0 || updateData.age > 150)) {
      return errorResponse(res, 400, 'Invalid age');
    }

    if (updateData.gender) {
      const validGenders = ['MALE', 'FEMALE', 'OTHER'];
      if (!validGenders.includes(updateData.gender)) {
        return errorResponse(res, 400, 'Invalid gender');
      }
    }

    const patient = await patientService.updatePatient(patientId, userId, updateData);

    logger.info('Patient updated', { patientId, userId });

    return successResponse(res, 200, 'Patient updated successfully', patient);

  } catch (error) {
    logger.error('Update patient error', { error: error.message });
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return errorResponse(res, 404, error.message);
    }
    
    return errorResponse(res, 500, 'Failed to update patient', error.message);
  }
};

const deletePatient = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = req.params.id;

    const patient = await patientService.deletePatient(patientId, userId);

    logger.info('Patient deleted (soft)', { patientId, userId });

    return successResponse(res, 200, 'Patient deleted successfully', patient);

  } catch (error) {
    logger.error('Delete patient error', { error: error.message });
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return errorResponse(res, 404, error.message);
    }
    
    return errorResponse(res, 500, 'Failed to delete patient', error.message);
  }
};

const updatePatientStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, 400, 'Status is required');
    }

    const patient = await patientService.updatePatientStatus(patientId, userId, status);

    logger.info('Patient status updated', { patientId, status, userId });

    return successResponse(res, 200, 'Patient status updated successfully', patient);

  } catch (error) {
    logger.error('Update patient status error', { error: error.message });
    
    if (error.message.includes('Invalid status')) {
      return errorResponse(res, 400, error.message);
    }
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return errorResponse(res, 404, error.message);
    }
    
    return errorResponse(res, 500, 'Failed to update patient status', error.message);
  }
};

const dischargePatient = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = req.params.id;

    const patient = await patientService.dischargePatient(patientId, userId);

    logger.info('Patient discharged', { patientId, userId });

    return successResponse(res, 200, 'Patient discharged successfully', patient);

  } catch (error) {
    logger.error('Discharge patient error', { error: error.message });
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return errorResponse(res, 404, error.message);
    }
    
    return errorResponse(res, 500, 'Failed to discharge patient', error.message);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  updatePatientStatus,
  dischargePatient
};
