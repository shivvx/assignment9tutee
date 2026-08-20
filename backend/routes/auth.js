const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
// token bnane ka helper function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ye_mera_super_secret_jwt_key_hai_dosto_12345', { expiresIn: '30d' });
};
// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, department, organization } = req.body;
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, role, phone, department, organization });
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, organization: user.organization }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Login API
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, organization: user.organization, department: user.department }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Profile info fetching route
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});
// Get list of hosts for dropdown (no auth required because visitors can list hosts to select them)
router.get('/hosts', async (req, res) => {
  try {
    const org = req.query.organization || 'Default Org';
    const hosts = await User.find({ role: 'host', organization: org }).select('name department email phone');
    res.json({ success: true, hosts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;
