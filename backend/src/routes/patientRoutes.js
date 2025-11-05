const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/supabaseAuthMiddleware');
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  updatePatientStatus,
  dischargePatient
} = require('../controllers/patientController');

router.get('/', protect, getPatients);
router.post('/', protect, createPatient);
router.get('/:id', protect, getPatientById);
router.put('/:id', protect, updatePatient);
router.delete('/:id', protect, deletePatient);
router.patch('/:id/status', protect, updatePatientStatus);
router.patch('/:id/discharge', protect, dischargePatient);

module.exports = router;
