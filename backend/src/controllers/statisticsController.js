const Expense = require('../models/Expense');

// Thống kê chi tiêu/thu nhập theo tháng
exports.monthly = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ message: 'Thiếu tham số year hoặc month.' });
    }
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    const expenses = await Expense.find({
      userId: req.user.userId,
      date: { $gte: start, $lt: end }
    });
    const totalExpense = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    res.json({
      totalExpense,
      totalIncome,
      items: expenses
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};
