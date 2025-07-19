const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const auth = require('../middlewares/auth');

// Thống kê chi tiêu/thu nhập theo tháng
router.get('/monthly', auth, statisticsController.monthly);

module.exports = router;
