const multer = require('multer');

// Use memory storage for serverless compatibility
// Files are stored in memory instead of on disk
const storage = multer.memoryStorage();

// Netlify serverless functions have 10MB payload limit (better than Vercel's 4.5MB)
// Set file size limit to 9MB to stay well within limits
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 9 * 1024 * 1024, // 9MB limit (safe for Netlify free tier)
    files: 1 // Only allow 1 file at a time
  }
}).single('file');

module.exports = upload;
