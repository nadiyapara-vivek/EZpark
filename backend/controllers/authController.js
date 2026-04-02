const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, vehicleNumber } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, phone, vehicleNumber });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, vehicleNumber: user.vehicleNumber }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, vehicleNumber: user.vehicleNumber }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password (simple token gen, no email)
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user with that email' });
    }
    // In production, send email with token. For now, return a mock reset token.
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.status(200).json({ success: true, message: 'Password reset token generated', resetToken });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Invalid token' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Token expired or invalid' });
  }
};