const mongoose = require('mongoose');
const LimitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  amount: { type: Number, required: true },
  period: { type: String, enum: ['month', 'week'], required: true },
  periodValue: { type: String, required: true }, // ví dụ: '2025-07'
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Limit', LimitSchema);
