const User = require('../models/User');
const Reel = require('../models/Reel');
const ChatMessage = require('../models/ChatMessage');

exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalReels = await Reel.countDocuments();
    const totalMessages = await ChatMessage.countDocuments();

    // Example: active users in last 24 hours
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
    });

    res.json({
      totalUsers,
      totalReels,
      totalMessages,
      activeUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
