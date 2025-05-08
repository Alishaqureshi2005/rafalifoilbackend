const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if it's an admin token
      if (decoded.isAdmin) {
        req.admin = await Admin.findById(decoded.id).select('-password');
        if (!req.admin) {
          return res.status(401).json({ message: 'Not authorized, admin not found' });
        }
      } else {
        // Get user from the token
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
      }

      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
  next();
};