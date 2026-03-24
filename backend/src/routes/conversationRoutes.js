const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversation,
  deleteConversation,
} = require('../controllers/conversationController');
const auth = require('../middlewares/auth');

router.get('/', auth, getConversations);
router.get('/:id', auth, getConversation);
router.delete('/:id', auth, deleteConversation);

module.exports = router;
