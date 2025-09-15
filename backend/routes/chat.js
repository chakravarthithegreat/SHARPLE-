const express = require('express');
const Message = require('../models/Message');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/chat/messages
// @desc    Get messages for a chat
// @access  Private
router.get('/messages', authenticateToken, async (req, res) => {
  try {
    const { chatType, chatId, limit = 50, skip = 0 } = req.query;
    
    const messages = await Message.getByChat(chatType, chatId, limit, skip);
    
    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      message: 'Failed to get messages',
      error: error.message
    });
  }
});

// @route   POST /api/chat/messages
// @desc    Send a message
// @access  Private
router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const messageData = {
      ...req.body,
      sender: req.user._id
    };
    
    const message = new Message(messageData);
    await message.save();
    
    res.status(201).json({
      message: 'Message sent successfully',
      messageData: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      message: 'Failed to send message',
      error: error.message
    });
  }
});

module.exports = router;
