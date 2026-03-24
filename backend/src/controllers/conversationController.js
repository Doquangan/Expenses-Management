const Conversation = require('../models/Conversation');

// GET /api/conversations — Danh sách conversations của user (không kèm messages)
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.userId })
      .select('title updatedAt createdAt')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// GET /api/conversations/:id — Chi tiết 1 conversation (kèm messages)
exports.getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    res.json(conversation);
  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// DELETE /api/conversations/:id — Xóa conversation
exports.deleteConversation = async (req, res) => {
  try {
    const result = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!result) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    res.json({ message: 'Conversation deleted.' });
  } catch (err) {
    console.error('Delete conversation error:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};
