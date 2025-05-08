const { testLikePost, testCommentPost } = require('./test-socket');

// Wait for connection to establish
setTimeout(() => {
  // Test liking a post
  testLikePost('test-post-id-1');
  
  // Test commenting on a post
  testCommentPost('test-post-id-1', 'This is a test comment');
}, 2000); 