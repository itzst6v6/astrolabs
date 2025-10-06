const express = require('express');
const fileController = require('../../controllers/file.controller');
const uploadHandler = require('../../middleware/upload.handler');

const router = express.Router();

// PUBLIC ENDPOINTS - No authentication required
router.post('/upload', uploadHandler, fileController.upload);
router.get('/download/:publicToken', fileController.download);

module.exports = router;
