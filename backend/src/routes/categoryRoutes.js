const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middlewares/auth');

// Tạo mới category
router.post('/', auth, categoryController.create);
// Lấy tất cả category
router.get('/', auth, categoryController.getAll);

// Cập nhật category
router.patch('/:id', auth, categoryController.update);
// Xóa category
router.delete('/:id', auth, categoryController.delete);

module.exports = router;
