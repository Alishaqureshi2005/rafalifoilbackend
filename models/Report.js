const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportedContentId: { type: mongoose.Schema.Types.ObjectId },
  contentType: { type: String, enum: ['reel', 'comment', 'user'], required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
