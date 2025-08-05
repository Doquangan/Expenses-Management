const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');

// API cảnh báo hạn mức cho dashboard
router.get('/limit-warnings', auth, dashboardController.getLimitWarnings);

module.exports = router;
