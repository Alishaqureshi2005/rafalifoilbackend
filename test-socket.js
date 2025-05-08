const { io } = require('socket.io-client');

// Create a socket connection
const socket = io('http://localhost:7000', {
  auth: {
    token: 'your-jwt-token-here' // Replace with a valid JWT token
  }
});

// Connection event handlers
socket.on('connect', () => {
  console.log('Connected to socket server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

// Listen for post events
socket.on('new_post', (data) => {
  console.log('New post received:', data);
});

socket.on('post_like_updated', (data) => {
  console.log('Post like updated:', data);
});

socket.on('new_comment', (data) => {
  console.log('New comment received:', data);
});

// Test functions
const testLikePost = (postId) => {
  socket.emit('like_post', { postId });
  console.log('Like post event emitted for post:', postId);
};

const testCommentPost = (postId, comment) => {
  socket.emit('comment_post', { postId, comment });
  console.log('Comment event emitted for post:', postId);
};

// Export test functions
module.exports = {
  testLikePost,
  testCommentPost
}; 