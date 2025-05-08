const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOTP, sendEmail } = require('../utils/otpUtil');
const UserProfile = require('../models/UserProfile');
const FriendRequest = require('../models/FriendRequest');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Log the incoming request body

    const { firstName, surname, gender, dateOfBirth, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists with this email:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate verification OTP
    const verificationOTP = generateOTP();
    const verificationOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    const user = new User({
      firstName,
      surname,
      gender,
      dateOfBirth,
      email,
      password,
      verificationOTP,
      verificationOTPExpiry
    });

    console.log('Saving user to database...');
    await user.save();
    console.log('User saved successfully:', user);

    // Send verification email
    await sendEmail(
      email,
      'Email Verification - Dating App',
      `Welcome to Dating App! Your verification code is: ${verificationOTP}. It expires in 10 minutes.`
    );

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    console.log('JWT token generated:', token);

    res.status(201).json({
      message: 'User created successfully. Please check your email for verification code.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        surname: user.surname,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Error in createUser:', error.message); // Log the error
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Add these to your existing exports

// Helper function for social login response
const sendSocialLoginResponse = (user, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
  res.json({
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      surname: user.surname,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      googleId: user.googleId,
      facebookId: user.facebookId
    }
  });
};

// Link Google account
exports.linkGoogleAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.googleId = req.body.googleId;
    await user.save();
    sendSocialLoginResponse(user, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Link Facebook account
exports.linkFacebookAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.facebookId = req.body.facebookId;
    await user.save();
    sendSocialLoginResponse(user, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Get a particular user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// User login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        surname: user.surname,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Forget password - send OTP
exports.forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const otp = generateOTP();
    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

    await sendEmail(
      email,
      'Password Reset OTP',
      `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`
    );

    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify email OTP
exports.verifyEmailOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (
      user.verificationOTP !== otp ||
      user.verificationOTPExpiry < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    user.verificationOTP = null;
    user.verificationOTPExpiry = null;
    user.isEmailVerified=true;
    await user.save();
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from the token
    console.log('User ID:', userId);

    // Fetch user info
    const user = await User.findById(userId).select('-password');
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User:', user);

    // Fetch profile picture
    const userProfile = await UserProfile.findOne({ user: userId });
    const profilePic = userProfile ? userProfile.profilePic : null;
    console.log('Profile Picture:', profilePic);

    // Count friends
    const friendsCount = await FriendRequest.countDocuments({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' },
      ],
    });
    console.log('Friends Count:', friendsCount);

    res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        surname: user.surname,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      },
      profilePic,
      friendsCount,
    });
  } catch (error) {
    console.error('Error in getUserProfile:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload profile picture
exports.uploadProfilePic = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming `protect` middleware adds `user` to `req`
    const profilePicPath = `${req.protocol}://${req.get('host')}/uploads/profile-pics/${req.file.filename}`; // Construct the full URL

    // Check if the user already has a profile
    let userProfile = await UserProfile.findOne({ user: userId });

    if (userProfile) {
      // Update existing profile
      userProfile.profilePic = profilePicPath;
      await userProfile.save();
    } else {
      // Create a new profile
      userProfile = new UserProfile({
        user: userId,
        profilePic: profilePicPath
      });
      await userProfile.save();
    }

    res.status(200).json({ message: 'Profile picture uploaded successfully', profilePic: profilePicPath });
  } catch (error) {
    console.error('Error in uploadProfilePic:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send verification email
exports.sendVerificationEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    const otp = generateOTP();
    user.verificationOTP = otp;
    user.verificationOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

    await sendEmail(
      user.email,
      'Email Verification',
      `Your verification code is: ${otp}. It expires in 10 minutes.`
    );

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify email with OTP
exports.verifyEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otp } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (
      user.verificationOTP !== otp ||
      !user.verificationOTPExpiry ||
      user.verificationOTPExpiry < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isEmailVerified = true;
    user.verificationOTP = null;
    user.verificationOTPExpiry = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error in verifyEmail:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// @desc    Forget password - Send OTP
// @route   POST /api/users/forget-password
exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate and save OTP
    const otp = generateOTP();
    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP email
    await sendEmail(
      email,
      'Password Reset OTP',
      `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`
    );

    res.status(200).json({
      success: true,
      message: 'OTP sent to registered email'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify Reset OTP
// @route   POST /api/users/verify-reset-otp
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.resetOTP !== otp || user.resetOTPExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Clear OTP after successful verification
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reset Password
// @route   POST /api/users/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};