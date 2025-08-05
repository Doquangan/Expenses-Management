const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null: mặc định, còn lại: của user
  createdAt: { type: Date, default: Date.now }
});

CategorySchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
