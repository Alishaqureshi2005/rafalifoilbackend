const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  job: {
    title: String,
    company: String,
    industry: String
  },
  education: [{
    degree: String,
    field: String,
    institution: String,
    year: Number
  }],
  location: {
    city: String,
    country: String
  },
  relationshipStatus: {
    type: String,
    enum: ['Single', 'Married', 'Divorced', 'Widowed', 'In a relationship', 'Prefer not to say']
  },
  skills: [String],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  profilePic: String,
  coverPic: String
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);