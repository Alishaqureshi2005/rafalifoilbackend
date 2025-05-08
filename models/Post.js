const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who created the post
    content: { type: String, required: true }, // Text content of the post
    image: { type: String }, // Optional image URL
    // mediaUrl: { type: String }, // URL for media (image or video)
    // mediaType: { type: String, enum: ['image', 'video'], default: 'image' }, // Type of media (image or video)
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of users who liked the post
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true } // Automatically add `createdAt` and `updatedAt` fields
);

module.exports = mongoose.model('Post', postSchema);