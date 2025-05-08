// uploadMiddleware.js
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir;

    if (req.baseUrl.includes('/api/posts')) {
      uploadDir = path.join(__dirname, '../uploads/posts');
    } else if (req.baseUrl.includes('/api/users')) {
      uploadDir = path.join(__dirname, '../uploads/profile-pics');
    } else {
      uploadDir = path.join(__dirname, '../uploads/others');
    }

    ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (req.baseUrl.includes('/api/posts')) {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image/video files are allowed!'), false);
    }
  } else if (req.baseUrl.includes('/api/users')) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  } else {
    cb(new Error('Invalid file type!'), false);
  }
};

const upload = multer({
  storage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB limit for posts
    files: 1
  },
  fileFilter
});

module.exports = upload;