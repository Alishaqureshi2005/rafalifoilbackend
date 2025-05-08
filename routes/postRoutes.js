const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createPost, getAllPosts, getAllPostsFeed, likePost, addComment } = require('../controllers/postController');

// Create a new post with optional image upload
router.post('/', protect, upload.single('media'), createPost);
// Get all posts created by the logged-in user
router.get('/my-posts', protect, getAllPosts);

// Get all posts (news feed)
router.get('/feed', protect, getAllPostsFeed);

// Like or unlike a post
router.put('/:id/like', protect, likePost);

// Add a comment to a post
router.post('/:id/comment', protect, addComment);

module.exports = router;