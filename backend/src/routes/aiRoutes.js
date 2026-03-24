// Route cho AI gợi ý tiết kiệm & Chatbot
const express = require('express');
const router = express.Router();
const { getSavingSuggestion, handleChat } = require('../controllers/aiController');
const auth = require('../middlewares/auth');

router.get('/saving-suggestion', auth, getSavingSuggestion);
router.post('/chat', auth, handleChat);

module.exports = router;
