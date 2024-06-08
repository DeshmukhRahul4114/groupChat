// routes/groupRoutes.js or create a new file routes/messageRoutes.js
const express = require('express');
const messageController = require('../controllers/messageController');
const router = express.Router();

router.post('/:groupId/admsg', messageController.addMessage);
router.post('/messages/like', messageController.likeMessage);
router.get('/:groupId/messages', messageController.getMessages);

module.exports = router;
