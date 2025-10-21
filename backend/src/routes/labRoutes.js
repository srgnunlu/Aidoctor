const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { protect } = require('../middleware/firebaseAuthMiddleware');

router.get('/patients/:patientId/labs', protect, labController.getAllLabResults);
router.post('/patients/:patientId/labs', protect, labController.createLabResult);
router.patch('/patients/:patientId/labs/:labId/status', protect, labController.updateLabStatus);
router.put('/patients/:patientId/labs/:labId', protect, labController.updateLabResult);

module.exports = router;
