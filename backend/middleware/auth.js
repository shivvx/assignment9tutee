const jwt = require('jsonwebtoken');
const User = require('../models/User');
// middleware to check JWT token from request headers
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Extract token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ye_mera_super_secret_jwt_key_hai_dosto_12345');
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found, login again' });
      }
      next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Token verify nahi hua' });
    }
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied: Token missing' });
  }
};
// role checking helper
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Access Denied: '${req.user ? req.user.role : 'Unknown'}' role is unauthorized` });
    }
    next();
  };
};
module.exports = { protect, authorize };
