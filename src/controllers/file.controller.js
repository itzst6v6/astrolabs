const fileService = require('../services/file.service');
const tokenService = require('../services/token.service');
const path = require('path');

const upload = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file selected.' });
  try {
    const publicToken = tokenService.generatePublicToken();
    await fileService.processAndEncryptFile(publicToken, req.file.path, req.file.originalname);
    res.status(201).json({ success: true, publicToken });
  } catch (e) { res.status(500).json({ success: false, message: 'Could not process file.' }); }
};

const download = async (req, res) => {
  try {
    const { decryptedContent, metadata } = await fileService.retrieveAndDecryptFile(req.params.publicToken);
    res.setHeader('Content-Disposition', `attachment; filename="${metadata.original_filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(decryptedContent);
  } catch (e) {
    // Redirect to file not found page instead of returning JSON
    res.redirect('/file-not-found.html');
  }
};

module.exports = { upload, download };
