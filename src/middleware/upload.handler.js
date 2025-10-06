const multer = require('multer');

// Use memory storage for serverless compatibility
// Files are stored in memory instead of on disk
const storage = multer.memoryStorage();

// Vercel serverless functions have payload limits (typically 4.5MB for free tier)
// Set file size limit to 20MB to be more practical for file hosting
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit (more practical)
    files: 1 // Only allow 1 file at a time
  }
}).single('file');

module.exports = upload;
