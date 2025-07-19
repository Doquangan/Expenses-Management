const Category = require('../models/Category');


// Tạo mới category cho user, không trùng với mặc định hoặc của user
exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;
    // Kiểm tra trùng tên với mặc định hoặc của user
    const existed = await Category.findOne({
      name,
      $or: [
        { user: null },
        { user: userId }
      ]
    });
    if (existed) {
      return res.status(400).json({ message: 'Tên danh mục đã tồn tại.' });
    }
    // Tìm id lớn nhất hiện tại
    const lastCat = await Category.findOne({}).sort({ id: -1 });
    let nextNumber = 1;
    if (lastCat && lastCat.id) {
      const match = lastCat.id.match(/CG(\d{5})/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const newId = `CG${String(nextNumber).padStart(5, '0')}`;
    const newCat = new Category({ id: newId, name, description, user: userId });
    await newCat.save();
    res.status(201).json(newCat);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};


// Lấy tất cả category: mặc định + của user
exports.getAll = async (req, res) => {
  try {
    const userId = req.user.userId;
    const categories = await Category.find({ $or: [ { user: null }, { user: userId } ] });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};



// Chỉnh sửa category của user, không cho phép với mặc định
exports.update = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, description } = req.body;
    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy category.' });
    if (!cat.user || cat.user.toString() !== userId) {
      return res.status(403).json({ message: 'Chỉ được sửa category của riêng bạn.' });
    }
    // Kiểm tra trùng tên với mặc định hoặc của user
    if (name && name !== cat.name) {
      const existed = await Category.findOne({
        name,
        $or: [ { user: null }, { user: userId } ]
      });
      if (existed) {
        return res.status(400).json({ message: 'Tên danh mục đã tồn tại.' });
      }
      cat.name = name;
    }
    if (description !== undefined) cat.description = description;
    await cat.save();
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};


// Xóa category của user, không cho phép với mặc định
exports.delete = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy category.' });
    if (!cat.user || cat.user.toString() !== userId) {
      return res.status(403).json({ message: 'Chỉ được xóa category của riêng bạn.' });
    }
    await cat.deleteOne();
    res.json({ message: 'Đã xóa category.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};
