const express = require('express');
const router = express.Router();
const { adminLogin, createAdmin } = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Public route for admin login
router.post('/login', adminLogin);

// Protected route to create new admin (only accessible by existing admins)
router.post('/create', protect, isAdmin, createAdmin);

module.exports = router; 