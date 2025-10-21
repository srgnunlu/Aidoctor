const express = require('express');
const router = express.Router();
const ocrController = require('../controllers/ocrController');
const { protect } = require('../middleware/firebaseAuthMiddleware');

router.post('/:patientId/upload-and-process', protect, ocrController.uploadAndProcessOCR);

router.post('/:patientId/process', protect, ocrController.processImageOCR);

router.get('/:patientId', protect, ocrController.getOCRResults);

router.put('/:patientId/:ocrId/review', protect, ocrController.reviewOCRResult);

module.exports = router;
