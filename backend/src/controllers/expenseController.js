const Expense = require('../models/Expense');

// Tạo mới expense
exports.create = async (req, res) => {
  try {
    let { amount, description, date, category, type } = req.body;
    // Nếu là expense thì amount chuyển thành số âm
    if (type === 'expense' && amount > 0) {
      amount = -Math.abs(amount);
    }
    // Sinh id dạng EP00001 dựa trên số lớn nhất hiện tại
    const lastExpense = await Expense.findOne().sort({ id: -1 });
    let nextNumber = 1;
    if (lastExpense && lastExpense.id) {
      const match = lastExpense.id.match(/EP(\d{5})/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const newId = 'EP' + String(nextNumber).padStart(5, '0');
    const expense = new Expense({
      id: newId,
      userId: req.user.userId,
      amount,
      description,
      date,
      category,
      type
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// Lấy tất cả expense của user
exports.getAll = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.userId });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// Cập nhật expense
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    let { amount, description, date, category, type } = req.body;
    // Nếu là expense thì amount chuyển thành số âm
    if (type === 'expense' && amount > 0) {
      amount = -Math.abs(amount);
    }
    const updated = await Expense.findOneAndUpdate(
      { id, userId: req.user.userId },
      { amount, description, date, category, type },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy expense.' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// Xóa expense
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await Expense.findOneAndDelete({ id, userId: req.user.userId });
    res.json({ message: 'Xóa thành công.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};
