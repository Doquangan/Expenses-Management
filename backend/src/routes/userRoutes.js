const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


const auth = require('../middlewares/auth');

// Đăng ký tài khoản
router.post('/register', userController.register);

// Đăng nhập tài khoản
router.post('/login', userController.login);

// Lấy thông tin user hiện tại
router.get('/me', auth, userController.getProfile);

// Cập nhật thông tin user hiện tại
router.patch('/me', auth, userController.updateProfile);

// Đổi mật khẩu
router.post('/change-password', auth, userController.changePassword);

module.exports = router;
