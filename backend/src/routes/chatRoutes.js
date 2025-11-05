const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/supabaseAuthMiddleware');
const chatController = require('../controllers/chatController');

router.post('/patients/:patientId/chat', protect, chatController.sendMessage);
router.get('/patients/:patientId/chat', protect, chatController.getChatHistory);
router.delete('/patients/:patientId/chat', protect, chatController.clearChatHistory);

module.exports = router;
