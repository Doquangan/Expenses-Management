const Expense = require('../models/Expense');
const Limit = require('../models/Limit');
const Category = require('../models/Category');
const mongoose = require('mongoose');

// Tạo mới expense kèm cảnh báo hạn mức
exports.create = async (req, res) => {
  try {
    let { amount, description, date, category, type } = req.body;
    if (type === 'expense' && amount > 0) {
      amount = -Math.abs(amount);
    }
    // Nếu có category (dưới dạng name), lấy _id từ Category
    let categoryId = null;
    if (category) {
      // Nếu category là ObjectId dạng string thì dùng luôn, nếu không thì tra theo name
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryId = new mongoose.Types.ObjectId(category);
      } else {
        const catDoc = await Category.findOne({ name: category });
        if (catDoc) categoryId = catDoc._id;
      }
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
      category: category,
      categoryId: categoryId,
      type
    });
    await expense.save();

    // === Cảnh báo hạn mức ===
    let warning = null;
    if (type === 'expense') {
      // Xác định kỳ hạn hiện tại (tháng)
      const d = date ? new Date(date) : new Date();
      const period = 'month';
      const periodValue = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      // Tổng chi tiêu theo category (dùng categoryId)
      let catMatch = {};
      if (categoryId) {
        catMatch.categoryId = categoryId;
      }
      const totalCat = await Expense.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.user.userId), type: 'expense', ...catMatch,
          date: { $gte: new Date(periodValue + '-01'), $lt: new Date(d.getFullYear(), d.getMonth() + 1, 1) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      // Tổng chi tiêu tất cả
      const totalAll = await Expense.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.user.userId), type: 'expense',
          date: { $gte: new Date(periodValue + '-01'), $lt: new Date(d.getFullYear(), d.getMonth() + 1, 1) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      // Lấy hạn mức theo category (dùng categoryId)
      let limitCat = null;
      if (categoryId) {
        limitCat = await Limit.findOne({ userId: req.user.userId, categoryId: categoryId, period, periodValue });
      } else {
        limitCat = await Limit.findOne({ userId: req.user.userId, categoryId: null, period, periodValue });
      }
      // Lấy hạn mức tổng
      const limitAll = await Limit.findOne({ userId: req.user.userId, categoryId: null, period, periodValue });
      // Cảnh báo nếu gần/vượt hạn mức
      if (limitCat && totalCat.length > 0) {
        const percent = Math.abs(totalCat[0].total) / limitCat.amount;
        if (percent >= 1) warning = `Bạn đã vượt hạn mức ${category ? 'cho ' + category : ''} tháng này!`;
        else if (percent >= 0.8) warning = `Bạn đã chi hơn 80% hạn mức ${category ? 'cho ' + category : ''} tháng này!`;
      }
      if (!warning && limitAll && totalAll.length > 0) {
        const percent = Math.abs(totalAll[0].total) / limitAll.amount;
        if (percent >= 1) warning = 'Bạn đã vượt tổng hạn mức chi tiêu tháng này!';
        else if (percent >= 0.8) warning = 'Bạn đã chi hơn 80% tổng hạn mức chi tiêu tháng này!';
      }
    }
    res.status(201).json(warning ? { expense, warning } : expense);
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
    // Nếu có category (dưới dạng name), lấy _id từ Category
    let categoryId = null;
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryId = new mongoose.Types.ObjectId(category);
      } else {
        const catDoc = await Category.findOne({ name: category });
        if (catDoc) categoryId = catDoc._id;
      }
    }
    const updated = await Expense.findOneAndUpdate(
      { id, userId: req.user.userId },
      { amount, description, date, category, categoryId, type },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy expense.' });
    }

    // === Cảnh báo hạn mức khi update ===
    let warning = null;
    if (type === 'expense') {
      const d = date ? new Date(date) : new Date();
      const period = 'month';
      const periodValue = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      let catMatch = {};
      if (categoryId) {
        catMatch.categoryId = categoryId;
      }
      const totalCat = await Expense.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.user.userId), type: 'expense', ...catMatch,
          date: { $gte: new Date(periodValue + '-01'), $lt: new Date(d.getFullYear(), d.getMonth() + 1, 1) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalAll = await Expense.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.user.userId), type: 'expense',
          date: { $gte: new Date(periodValue + '-01'), $lt: new Date(d.getFullYear(), d.getMonth() + 1, 1) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      let limitCat = null;
      if (categoryId) {
        limitCat = await Limit.findOne({ userId: req.user.userId, categoryId: categoryId, period, periodValue });
      } else {
        limitCat = await Limit.findOne({ userId: req.user.userId, categoryId: null, period, periodValue });
      }
      const limitAll = await Limit.findOne({ userId: req.user.userId, categoryId: null, period, periodValue });
      if (limitCat && totalCat.length > 0) {
        const percent = Math.abs(totalCat[0].total) / limitCat.amount;
        if (percent >= 1) warning = `Bạn đã vượt hạn mức ${category ? 'cho ' + category : ''} tháng này!`;
        else if (percent >= 0.8) warning = `Bạn đã chi hơn 80% hạn mức ${category ? 'cho ' + category : ''} tháng này!`;
      }
      if (!warning && limitAll && totalAll.length > 0) {
        const percent = Math.abs(totalAll[0].total) / limitAll.amount;
        if (percent >= 1) warning = 'Bạn đã vượt tổng hạn mức chi tiêu tháng này!';
        else if (percent >= 0.8) warning = 'Bạn đã chi hơn 80% tổng hạn mức chi tiêu tháng này!';
      }
    }
    res.json(warning ? { expense: updated, warning } : updated);
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
