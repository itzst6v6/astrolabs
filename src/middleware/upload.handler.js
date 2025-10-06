const multer = require('multer');

// Use memory storage for serverless compatibility
// Files are stored in memory instead of on disk
const storage = multer.memoryStorage();

// Vercel free tier has ~4.5MB payload limit for serverless functions
// Set file size limit to 4MB to stay well within limits
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB limit (safe for free tier)
    files: 1 // Only allow 1 file at a time
  }
}).single('file');

module.exports = upload;
