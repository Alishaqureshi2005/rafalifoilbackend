// Import required modules
require('dotenv').config();  // Load environment variables from .env file
const express = require('express');
const cors = require('cors'); // Import cors
const http = require('http');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reelRoutes = require('./routes/reelRoutes');
const friendRoutes = require('./routes/friendRoutes');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes');
const FriendRequest = require('./models/FriendRequest');
const ChatMessage = require('./models/ChatMessage');
const { initializeSocket } = require('./socket');

// Connect to the database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Middleware to parse JSON
app.use(express.json());

// Set up CORS policy
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Allow requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true // Allow cookies and credentials
}));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/uploads', express.static('uploads'));

// Helper function to check if two users are friends
const areFriends = async (userId1, userId2) => {
  const friendship = await FriendRequest.findOne({
    $or: [
      { requester: userId1, recipient: userId2, status: 'accepted' },
      { requester: userId2, recipient: userId1, status: 'accepted' }
    ]
  });
  return !!friendship;
};

// Set up server port and start the server
const PORT = process.env.PORT || 7000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Example URL for profile pictures
const profilePicUrl = 'http://localhost:7000/uploads/profile-pics/<filename>';
console.log(`Profile pictures can be accessed at: ${profilePicUrl}`);
