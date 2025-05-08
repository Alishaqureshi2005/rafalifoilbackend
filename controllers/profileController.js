const UserProfile = require('../models/UserProfile');
const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await UserProfile.findOne({ user: userId })
      .populate('user', 'firstName surname email')
      .populate('followers', 'firstName surname profilePic')
      .populate('following', 'firstName surname profilePic');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create or update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Create update object with only provided fields
    const updateFields = {};
    const allowedFields = [
      'bio', 
      'job', 
      'education', 
      'location', 
      'relationshipStatus', 
      'skills'
    ];

    // Only add fields that exist in the request body
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // Add timestamp
    updateFields.lastUpdated = Date.now();

    // Update or create profile
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { user: userId },
      { $set: updateFields },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    ).select('-__v -user');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Follow a user
exports.followUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    // Check if user is trying to follow themselves
    if (userId === targetUserId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await UserProfile.findOne({ user: userId });
    const targetProfile = await UserProfile.findOne({ user: targetUserId });

    if (!profile || !targetProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if already following
    if (profile.following.includes(targetUserId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add to following and followers
    profile.following.push(targetUserId);
    targetProfile.followers.push(userId);

    await profile.save();
    await targetProfile.save();

    res.status(200).json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Error in followUser:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    const profile = await UserProfile.findOne({ user: userId });
    const targetProfile = await UserProfile.findOne({ user: targetUserId });

    if (!profile || !targetProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Remove from following and followers
    profile.following = profile.following.filter(id => id.toString() !== targetUserId);
    targetProfile.followers = targetProfile.followers.filter(id => id.toString() !== userId);

    await profile.save();
    await targetProfile.save();

    res.status(200).json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Error in unfollowUser:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 