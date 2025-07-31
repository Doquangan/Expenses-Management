const User = require('../models/User');
const bcrypt = require('bcrypt');


// Đăng ký tài khoản
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Đăng ký thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// Đăng nhập tài khoản
const jwt = require('jsonwebtoken');
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email không tồn tại.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không đúng.' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// Lấy thông tin user hiện tại
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user.' });
    const loginType =
      user.password === 'GOOGLE_OAUTH' ? 'google'
      : user.password === 'FACEBOOK_OAUTH' ? 'facebook'
      : 'local';
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      loginType
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// Cập nhật thông tin user hiện tại
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user.' });
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Vui lòng nhập đủ và mật khẩu mới phải từ 6 ký tự.' });
    }
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user.' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng.' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// Đặt mật khẩu cho user chưa có mật khẩu (đăng nhập Google/Facebook)
exports.setPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải từ 6 ký tự.' });
    }
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user.' });
    // Chỉ cho phép đặt mật khẩu nếu user chưa có mật khẩu (GOOGLE_OAUTH hoặc FACEBOOK_OAUTH)
    if (user.password !== 'GOOGLE_OAUTH' && user.password !== 'FACEBOOK_OAUTH') {
      return res.status(400).json({ message: 'Tài khoản đã có mật khẩu, hãy dùng chức năng đổi mật khẩu.' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Đặt mật khẩu thành công! Bạn có thể đăng nhập bằng email và mật khẩu.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.' });
  }
};
