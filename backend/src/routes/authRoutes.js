const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/firebaseAuthMiddleware');
const {
  register,
  getMe,
  updateProfile
} = require('../controllers/authController');

router.post('/register', register);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
