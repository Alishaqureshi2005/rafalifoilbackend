const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser
} = require('../controllers/profileController');

// Get user profile
router.get('/', protect, getProfile);

// Update user profile
router.put('/', protect, updateProfile);

// Follow a user
router.post('/follow/:targetUserId', protect, followUser);

// Unfollow a user
router.delete('/follow/:targetUserId', protect, unfollowUser);

module.exports = router; 