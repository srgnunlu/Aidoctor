const imagingService = require('../services/imagingService');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

const getAllImagingResults = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = req.params.patientId;

    const imagingResults = await imagingService.getAllImagingResults(patientId, userId);

    logger.info('Imaging results retrieved', { patientId, userId, count: imagingResults.length });
    return successResponse(res, 200, 'Imaging results retrieved successfully', imagingResults);
  } catch (error) {
    logger.error('Error retrieving imaging results', { error: error.message });
    return errorResponse(res, error.message === 'Patient not found or access denied' ? 404 : 500, error.message);
  }
};

const createImagingResult = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = req.params.patientId;
    const imagingData = req.body;

    if (!imagingData.imagingType) {
      return errorResponse(res, 400, 'Imaging type is required');
    }

    if (!imagingData.bodyPart) {
      return errorResponse(res, 400, 'Body part is required');
    }

    const validImagingTypes = ['XRAY', 'CT', 'MRI', 'ULTRASOUND', 'OTHER'];
    if (!validImagingTypes.includes(imagingData.imagingType)) {
      return errorResponse(res, 400, 'Invalid imaging type. Must be XRAY, CT, MRI, ULTRASOUND, or OTHER');
    }

    if (imagingData.status) {
      const validStatuses = ['PENDING', 'COMPLETED', 'REVIEWED'];
      if (!validStatuses.includes(imagingData.status)) {
        return errorResponse(res, 400, 'Invalid status. Must be PENDING, COMPLETED, or REVIEWED');
      }
    }

    const imagingResult = await imagingService.createImagingResult(patientId, userId, imagingData);

    logger.info('New imaging result created', { imagingId: imagingResult.id, patientId, userId });
    return successResponse(res, 201, 'Imaging result created successfully', imagingResult);
  } catch (error) {
    logger.error('Error creating imaging result', { error: error.message });
    return errorResponse(res, error.message === 'Patient not found or access denied' ? 404 : 500, error.message);
  }
};

module.exports = {
  getAllImagingResults,
  createImagingResult
};
