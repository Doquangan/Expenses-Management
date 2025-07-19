const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  category: { type: String },
  type: { type: String, enum: ['expense', 'income'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
