// Route cho AI gợi ý tiết kiệm
const express = require('express');
const router = express.Router();
const { getSavingSuggestion } = require('../controllers/aiController');
const auth = require('../middlewares/auth');

router.get('/saving-suggestion', auth, getSavingSuggestion);

module.exports = router;
