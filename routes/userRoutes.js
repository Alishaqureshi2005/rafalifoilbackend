const express = require('express');
const router = express.Router();
const { createUser, getUserById, loginUser, getAllUsers, getUserProfile, uploadProfilePic, sendVerificationEmail, verifyEmailOTP ,forgetPassword,
    verifyResetOTP,
    resetPassword} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Public route to create user (signup)
router.post('/create', createUser);
// Google and Facebook authentication routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
// Callback routes for Google and Facebook authentication
router.get('/google/callback', 
    passport.authenticate('google', { session: false }),
    (req, res) => {
      // Handle successful authentication
      const token = generateToken(req.user);
      res.redirect(`/auth/success?token=${token}`);
    }
  );
  
  router.get('/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    (req, res) => {
      // Handle successful authentication
      const token = generateToken(req.user);
      res.redirect(`/auth/success?token=${token}`);
    }
  );
  
  router.get('/success', (req, res) => {
    // You can customize this response or redirect to a frontend URL
    res.json({
      token: req.query.token,
      message: 'Authentication successful'
    });
  });
  
  function generateToken(user) {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  }
// Public route for user login
router.post('/login', loginUser);

// Email verification routes
router.post('/send-verification', protect, sendVerificationEmail);
router.post('/verify-email', protect, verifyEmailOTP);

// Protected route to get user profile (based on token)
router.get('/profile', protect, getUserProfile);

// Protected route to get all users
router.get('/', protect, getAllUsers);

// Protected route to get user by ID
router.get('/:id', protect, getUserById);

// Protected route to upload profile picture
router.post('/upload-profile-pic', protect, upload.single('profilePic'), uploadProfilePic);
// Password reset routes
router.post('/forget-password', forgetPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);
module.exports = router;
