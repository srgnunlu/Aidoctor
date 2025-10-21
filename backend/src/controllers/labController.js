const labService = require('../services/labService');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

const getAllLabResults = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = req.params.patientId;

    const labResults = await labService.getAllLabResults(patientId, userId);

    logger.info('Lab results retrieved', { patientId, userId, count: labResults.length });
    return successResponse(res, 200, 'Lab results retrieved successfully', labResults);
  } catch (error) {
    logger.error('Error retrieving lab results', { error: error.message });
    return errorResponse(res, error.message === 'Patient not found or access denied' ? 404 : 500, error.message);
  }
};

const createLabResult = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = req.params.patientId;
    const labData = req.body;

    if (!labData.testName) {
      return errorResponse(res, 400, 'Test name is required');
    }

    if (!labData.testType) {
      return errorResponse(res, 400, 'Test type is required');
    }

    const validTestTypes = ['BLOOD', 'URINE', 'OTHER'];
    if (!validTestTypes.includes(labData.testType)) {
      return errorResponse(res, 400, 'Invalid test type. Must be BLOOD, URINE, or OTHER');
    }

    if (labData.status) {
      const validStatuses = ['PENDING', 'COMPLETED', 'REVIEWED'];
      if (!validStatuses.includes(labData.status)) {
        return errorResponse(res, 400, 'Invalid status. Must be PENDING, COMPLETED, or REVIEWED');
      }
    }

    const labResult = await labService.createLabResult(patientId, userId, labData);

    logger.info('New lab result created', { labId: labResult.id, patientId, userId });
    return successResponse(res, 201, 'Lab result created successfully', labResult);
  } catch (error) {
    logger.error('Error creating lab result', { error: error.message });
    return errorResponse(res, error.message === 'Patient not found or access denied' ? 404 : 500, error.message);
  }
};

const updateLabStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = req.params.patientId;
    const labId = req.params.labId;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, 400, 'Status is required');
    }

    const validStatuses = ['PENDING', 'COMPLETED', 'REVIEWED'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 400, 'Invalid status. Must be PENDING, COMPLETED, or REVIEWED');
    }

    const labResult = await labService.updateLabStatus(labId, patientId, userId, status);

    logger.info('Lab status updated', { labId, patientId, userId, status });
    return successResponse(res, 200, 'Lab status updated successfully', labResult);
  } catch (error) {
    logger.error('Error updating lab status', { error: error.message });
    if (error.message === 'Patient not found or access denied') {
      return errorResponse(res, 404, error.message);
    }
    if (error.message === 'Lab result not found') {
      return errorResponse(res, 404, error.message);
    }
    return errorResponse(res, 500, error.message);
  }
};

const updateLabResult = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = req.params.patientId;
    const labId = req.params.labId;
    const updateData = req.body;

    const labResult = await labService.updateLabResult(labId, patientId, userId, updateData);

    logger.info('Lab result updated', { labId, patientId, userId });
    return successResponse(res, 200, 'Lab result updated successfully', labResult);
  } catch (error) {
    logger.error('Error updating lab result', { error: error.message });
    if (error.message === 'Patient not found or access denied') {
      return errorResponse(res, 404, error.message);
    }
    if (error.message === 'Lab result not found') {
      return errorResponse(res, 404, error.message);
    }
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  getAllLabResults,
  createLabResult,
  updateLabStatus,
  updateLabResult
};
