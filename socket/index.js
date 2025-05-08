const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user._id);

    // Join user's personal room
    socket.join(socket.user._id.toString());

    // Handle post like
    socket.on('like_post', async (data) => {
      const { postId } = data;
      io.emit('post_liked', {
        postId,
        userId: socket.user._id,
        userName: `${socket.user.firstName} ${socket.user.surname}`
      });
    });

    // Handle post comment
    socket.on('comment_post', async (data) => {
      const { postId, comment } = data;
      io.emit('post_commented', {
        postId,
        userId: socket.user._id,
        userName: `${socket.user.firstName} ${socket.user.surname}`,
        comment
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user._id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO
}; 