const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');

// Send friend request
router.post('/request', protect, friendController.sendFriendRequest);

// Respond to friend request (accept/reject)
router.post('/respond', protect, friendController.respondFriendRequest);

// Get friend requests
router.get('/requests', protect, friendController.getFriendRequests);

// Get friends list
router.get('/', protect, friendController.getFriends);

module.exports = router;
