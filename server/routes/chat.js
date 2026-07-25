const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateChat } = require('../middleware/validate');

const {
  getChatHistory,
  sendMessage,
  clearChatHistory
} = require('../controllers/chatController');

// All chat routes require auth
router.use(auth);

router.get('/:projectId', getChatHistory);
router.post('/:projectId', validateChat, sendMessage);
router.delete('/:projectId', clearChatHistory);

module.exports = router;
