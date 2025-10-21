const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/firebaseAuthMiddleware');
const vitalController = require('../controllers/vitalController');

router.get('/:patientId/vitals', protect, vitalController.getVitalSigns);
router.post('/:patientId/vitals', protect, vitalController.createVitalSign);
router.get('/:patientId/vitals/:vitalId', protect, vitalController.getVitalSignById);

module.exports = router;
