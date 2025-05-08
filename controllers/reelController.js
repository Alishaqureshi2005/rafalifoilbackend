const Reel = require('../models/Reel');

// Create a new reel
exports.createReel = async (req, res) => {
  try {
    const { description } = req.body;
    const userId = req.user._id; // Assuming `protect` middleware adds `user` to `req`

    // Construct the video URL if a video is uploaded
    const videoUrl = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/reels/${req.file.filename}`
      : null;

    if (!videoUrl) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    const reel = new Reel({
      user: userId,
      videoUrl,
      description
    });

    await reel.save();
    res.status(201).json({ message: 'Reel created successfully', reel });
  } catch (error) {
    console.error('Error in createReel:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all reels
exports.getAllReels = async (req, res) => {
  try {
    const reels = await Reel.find()
      .populate('user', 'firstName surname')
      .populate('comments.user', 'firstName surname')
      .sort({ createdAt: -1 });
    res.json(reels);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add comment to reel
exports.addComment = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }
    const comment = {
      user: req.user._id,
      text: req.body.text
    };
    reel.comments.push(comment);
    await reel.save();
    res.status(201).json(reel);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like a reel
exports.likeReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }
    if (reel.likes.includes(req.user._id)) {
      return res.status(400).json({ message: 'You already liked this reel' });
    }
    reel.likes.push(req.user._id);
    await reel.save();
    res.json(reel);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Share a reel (increment share count)
exports.shareReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }
    reel.shares += 1;
    await reel.save();
    res.json(reel);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
