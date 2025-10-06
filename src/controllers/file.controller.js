const fileService = require('../services/file.service');
const tokenService = require('../services/token.service');

const upload = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file selected.' });
  try {
    const publicToken = tokenService.generatePublicToken();
    // Pass file buffer instead of file path
    await fileService.processAndEncryptFile(publicToken, req.file.buffer, req.file.originalname);
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

const deleteFile = async (req, res) => {
  try {
    const publicToken = req.params.publicToken;
    if (!publicToken) {
      return res.status(400).json({ success: false, message: 'Token required' });
    }

    await fileService.deleteFile(publicToken);
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (e) {
    if (e.message === 'File not found') {
      res.status(404).json({ success: false, message: 'File not found' });
    } else {
      res.status(500).json({ success: false, message: 'Could not delete file' });
    }
  }
};

module.exports = { upload, download, deleteFile };
