const express = require('express');
const router = express.Router();
const imagingController = require('../controllers/imagingController');
const { protect } = require('../middleware/firebaseAuthMiddleware');

router.get('/patients/:patientId/imaging', protect, imagingController.getAllImagingResults);
router.post('/patients/:patientId/imaging', protect, imagingController.createImagingResult);

module.exports = router;
