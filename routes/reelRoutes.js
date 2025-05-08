const express = require('express');
const router = express.Router();
const reelController = require('../controllers/reelController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Create a new reel with video upload
router.post('/', protect, upload.single('video'), reelController.createReel);

// Get all reels
router.get('/', protect, reelController.getAllReels);

// Add comment to reel
router.post('/:id/comment', protect, reelController.addComment);

// Like a reel
router.post('/:id/like', protect, reelController.likeReel);

// Share a reel
router.post('/:id/share', protect, reelController.shareReel);

module.exports = router;
