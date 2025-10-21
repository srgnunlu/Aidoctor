const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');
const historyService = require('../services/historyService');

const getMedicalHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = req.params.patientId;

    const history = await historyService.getMedicalHistory(patientId, userId);

    if (!history) {
      return successResponse(res, 200, 'No medical history found for this patient', null);
    }

    return successResponse(res, 200, 'Medical history retrieved successfully', history);

  } catch (error) {
    logger.error('Get medical history error', { error: error.message });

    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return errorResponse(res, 404, error.message);
    }

    return errorResponse(res, 500, 'Failed to retrieve medical history', error.message);
  }
};

const createMedicalHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = req.params.patientId;
    const historyData = req.body;

    const history = await historyService.createMedicalHistory(patientId, userId, historyData);

    logger.info('Medical history created', { historyId: history.id, patientId, userId });

    return successResponse(res, 201, 'Medical history created successfully', history);

  } catch (error) {
    logger.error('Create medical history error', { error: error.message });

    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return errorResponse(res, 404, error.message);
    }

    if (error.message.includes('already exists')) {
      return errorResponse(res, 409, error.message);
    }

    return errorResponse(res, 500, 'Failed to create medical history', error.message);
  }
};

const updateMedicalHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { patientId, historyId } = req.params;
    const updateData = req.body;

    const history = await historyService.updateMedicalHistory(historyId, patientId, userId, updateData);

    logger.info('Medical history updated', { historyId, patientId, userId });

    return successResponse(res, 200, 'Medical history updated successfully', history);

  } catch (error) {
    logger.error('Update medical history error', { error: error.message });

    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return errorResponse(res, 404, error.message);
    }

    if (error.message.includes('No valid fields')) {
      return errorResponse(res, 400, error.message);
    }

    return errorResponse(res, 500, 'Failed to update medical history', error.message);
  }
};

module.exports = {
  getMedicalHistory,
  createMedicalHistory,
  updateMedicalHistory
};
