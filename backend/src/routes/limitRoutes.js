const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const limitController = require('../controllers/limitController');

// Đặt hoặc cập nhật hạn mức
router.post('/', auth, limitController.setLimit);
// Lấy danh sách hạn mức
router.get('/', auth, limitController.getLimits);

module.exports = router;
