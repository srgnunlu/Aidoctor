const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/firebaseAuthMiddleware');
const historyController = require('../controllers/historyController');

router.get('/:patientId/history', protect, historyController.getMedicalHistory);
router.post('/:patientId/history', protect, historyController.createMedicalHistory);
router.put('/:patientId/history/:historyId', protect, historyController.updateMedicalHistory);

module.exports = router;
