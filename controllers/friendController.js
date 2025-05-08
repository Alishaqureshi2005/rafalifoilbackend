const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');

// Send friend request
exports.sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    if (req.user._id.toString() === recipientId) {
      return res.status(400).json({ message: "You cannot send friend request to yourself" });
    }
    const existingRequest = await FriendRequest.findOne({
      requester: req.user._id,
      recipient: recipientId
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" });
    }
    const friendRequest = new FriendRequest({
      requester: req.user._id,
      recipient: recipientId
    });
    await friendRequest.save();
    res.status(201).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Respond to friend request (accept or reject)
exports.respondFriendRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body; // action: 'accepted' or 'rejected'
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }
    if (friendRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to respond to this request" });
    }
    if (!['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }
    friendRequest.status = action;
    await friendRequest.save();
    res.json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get friend requests for logged in user
exports.getFriendRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({ recipient: req.user._id, status: 'pending' })
      .populate('requester', 'firstName surname');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get friends list (accepted requests)
exports.getFriends = async (req, res) => {
  try {
    const acceptedRequests = await FriendRequest.find({
      $or: [
        { requester: req.user._id, status: 'accepted' },
        { recipient: req.user._id, status: 'accepted' }
      ]
    });
    const friendIds = acceptedRequests.map(req =>
      req.requester.toString() === req.user._id.toString() ? req.recipient : req.requester
    );
    const friends = await User.find({ _id: { $in: friendIds } }).select('firstName surname email');
    res.json(friends);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
