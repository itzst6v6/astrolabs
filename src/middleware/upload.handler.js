const multer = require('multer');

// Use memory storage for serverless compatibility
// Files are stored in memory instead of on disk
const storage = multer.memoryStorage();

module.exports = multer({ storage: storage }).single('file');
