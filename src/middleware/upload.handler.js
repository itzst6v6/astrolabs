const multer = require('multer');
const config = require('../config');

// Use memory storage for serverless compatibility
// Files are stored in memory instead of on disk
const storage = multer.memoryStorage();

// Get file size limit from platform configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.getFileSizeLimit(), // Dynamic based on platform
    files: 1 // Only allow 1 file at a time
  }
}).single('file');

module.exports = upload;
