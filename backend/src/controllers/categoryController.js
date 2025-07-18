const Category = require('../models/Category');

// Tạo mới category
exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Tên category đã tồn tại.' });
    }
    // Sinh id dạng CG00001 dựa trên số lớn nhất hiện tại
    const lastCategory = await Category.findOne().sort({ id: -1 });
    let nextNumber = 1;
    if (lastCategory && lastCategory.id) {
      const match = lastCategory.id.match(/CG(\d{5})/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const newId = 'CG' + String(nextNumber).padStart(5, '0');
    const category = new Category({ id: newId, name, description });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// Lấy tất cả category
exports.getAll = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};


// Cập nhật category
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updated = await Category.findOneAndUpdate(
      { id },
      { name, description },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy category.' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// Xóa category
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findOneAndDelete({ id });
    res.json({ message: 'Xóa thành công.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};
