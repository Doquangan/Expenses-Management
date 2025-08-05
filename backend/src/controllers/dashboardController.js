const Limit = require('../models/Limit');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const mongoose = require('mongoose');

// API trả về danh sách cảnh báo hạn mức cho dashboard
exports.getLimitWarnings = async (req, res) => {
  try {
    const { period = 'month', periodValue } = req.query;
    if (!periodValue) return res.status(400).json({ message: 'Thiếu periodValue' });
    const userId = req.user.userId;
    // Lấy tất cả hạn mức của user cho kỳ này
    const limits = await Limit.find({ userId, period, periodValue });
    if (!limits.length) return res.json([]);
    // Lấy tổng chi tiêu theo categoryId và tổng tất cả
    const warnings = [];
    for (const lim of limits) {
      let match = { userId: new mongoose.Types.ObjectId(userId), type: 'expense', date: { $gte: new Date(periodValue + '-01'), $lt: new Date(new Date(periodValue + '-01').getFullYear(), new Date(periodValue + '-01').getMonth() + 1, 1) } };
      if (lim.categoryId) match.categoryId = lim.categoryId;
      const totalArr = await Expense.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const total = totalArr.length > 0 ? Math.abs(totalArr[0].total) : 0;
      const percent = lim.amount > 0 ? total / lim.amount : 0;
      if (percent >= 0.8) {
        // Lấy tên category
        let catName = null;
        if (lim.categoryId) {
          const cat = await Category.findById(lim.categoryId);
          catName = cat ? cat.name : '---';
        }
        warnings.push({
          limitId: lim._id,
          categoryId: lim.categoryId,
          categoryName: catName,
          amount: lim.amount,
          total,
          percent: Math.round(percent * 100),
          period: lim.period,
          periodValue: lim.periodValue,
          type: percent >= 1 ? 'over' : 'warning'
        });
      }
    }
    res.json(warnings);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};
