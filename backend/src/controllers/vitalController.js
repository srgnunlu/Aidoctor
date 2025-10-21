const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');
const vitalService = require('../services/vitalService');

const getVitalSigns = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = req.params.patientId;

    const vitals = await vitalService.getVitalSigns(patientId, userId);

    return successResponse(res, 200, 'Vital signs retrieved successfully', vitals);

  } catch (error) {
    logger.error('Get vital signs error', { error: error.message });

    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return errorResponse(res, 404, error.message);
    }

    return errorResponse(res, 500, 'Failed to retrieve vital signs', error.message);
  }
};

const getVitalSignById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { patientId, vitalId } = req.params;

    const vital = await vitalService.getVitalSignById(vitalId, patientId, userId);

    if (!vital) {
      return errorResponse(res, 404, 'Vital sign not found');
    }

    return successResponse(res, 200, 'Vital sign retrieved successfully', vital);

  } catch (error) {
    logger.error('Get vital sign by ID error', { error: error.message });

    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return errorResponse(res, 404, error.message);
    }

    return errorResponse(res, 500, 'Failed to retrieve vital sign', error.message);
  }
};

const createVitalSign = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = req.params.patientId;
    const vitalData = req.body;

    if (vitalData.bloodPressureSystolic !== undefined && vitalData.bloodPressureSystolic !== null) {
      if (vitalData.bloodPressureSystolic < 0 || vitalData.bloodPressureSystolic > 300) {
        return errorResponse(res, 400, 'Invalid systolic blood pressure');
      }
    }

    if (vitalData.bloodPressureDiastolic !== undefined && vitalData.bloodPressureDiastolic !== null) {
      if (vitalData.bloodPressureDiastolic < 0 || vitalData.bloodPressureDiastolic > 200) {
        return errorResponse(res, 400, 'Invalid diastolic blood pressure');
      }
    }

    if (vitalData.heartRate !== undefined && vitalData.heartRate !== null) {
      if (vitalData.heartRate < 0 || vitalData.heartRate > 300) {
        return errorResponse(res, 400, 'Invalid heart rate');
      }
    }

    if (vitalData.temperature !== undefined && vitalData.temperature !== null) {
      if (vitalData.temperature < 30 || vitalData.temperature > 45) {
        return errorResponse(res, 400, 'Invalid temperature');
      }
    }

    if (vitalData.oxygenSaturation !== undefined && vitalData.oxygenSaturation !== null) {
      if (vitalData.oxygenSaturation < 0 || vitalData.oxygenSaturation > 100) {
        return errorResponse(res, 400, 'Invalid oxygen saturation');
      }
    }

    if (vitalData.respiratoryRate !== undefined && vitalData.respiratoryRate !== null) {
      if (vitalData.respiratoryRate < 0 || vitalData.respiratoryRate > 100) {
        return errorResponse(res, 400, 'Invalid respiratory rate');
      }
    }

    const vital = await vitalService.createVitalSign(patientId, userId, vitalData);

    logger.info('New vital sign created', { vitalId: vital.id, patientId, userId });

    return successResponse(res, 201, 'Vital sign created successfully', vital);

  } catch (error) {
    logger.error('Create vital sign error', { error: error.message });

    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return errorResponse(res, 404, error.message);
    }

    return errorResponse(res, 500, 'Failed to create vital sign', error.message);
  }
};

module.exports = {
  getVitalSigns,
  getVitalSignById,
  createVitalSign
};
