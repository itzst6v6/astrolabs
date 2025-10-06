const express = require('express');
const fileController = require('../../controllers/file.controller');
const uploadHandler = require('../../middleware/upload.handler');
const debugController = require('../../controllers/debug.controller');

const router = express.Router();

// PUBLIC ENDPOINTS - No authentication required
router.post('/upload', uploadHandler, fileController.upload);
router.get('/download/:publicToken', fileController.download);
router.delete('/delete/:publicToken', fileController.deleteFile);

// Debug endpoint to check platform configuration
router.get('/debug/platform', debugController.getPlatformInfo);

module.exports = router;
