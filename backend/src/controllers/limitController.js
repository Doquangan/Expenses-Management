const Limit = require('../models/Limit');

// Đặt hoặc cập nhật hạn mức
exports.setLimit = async (req, res) => {
  try {
    const { categoryId, amount, period, periodValue } = req.body;
    if (!amount || !period || !periodValue) {
      return res.status(400).json({ message: 'Thiếu thông tin hạn mức.' });
    }
    const query = {
      userId: req.user.userId,
      categoryId: categoryId || null,
      period,
      periodValue
    };
    let limit = await Limit.findOne(query);
    if (limit) {
      limit.amount = amount;
      await limit.save();
    } else {
      limit = new Limit({ ...query, amount });
      await limit.save();
    }
    res.json({ message: 'Đặt hạn mức thành công!', limit });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// Lấy danh sách hạn mức theo user, period, periodValue
exports.getLimits = async (req, res) => {
  try {
    const { period, periodValue } = req.query;
    const query = { userId: req.user.userId };
    if (period) query.period = period;
    if (periodValue) query.periodValue = periodValue;
    const limits = await Limit.find(query);
    res.json(limits);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};
