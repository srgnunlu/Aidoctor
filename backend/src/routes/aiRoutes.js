const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/firebaseAuthMiddleware');
const aiController = require('../controllers/aiController');

router.post('/patients/:patientId/analyze', protect, aiController.analyzePatient);
router.get('/patients/:patientId/analyses', protect, aiController.getPatientAnalyses);

module.exports = router;
