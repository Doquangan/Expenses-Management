const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middlewares/auth');

// Tạo mới expense
router.post('/', auth, expenseController.create);
// Lấy tất cả expense của user
router.get('/', auth, expenseController.getAll);
// Cập nhật expense
router.patch('/:id', auth, expenseController.update);
// Xóa expense
router.delete('/:id', auth, expenseController.delete);

module.exports = router;
