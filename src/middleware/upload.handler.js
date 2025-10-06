const multer = require('multer');
const fs = require('fs');
const config = require('../config');

if (!fs.existsSync(config.tempUploadPath)) {
    fs.mkdirSync(config.tempUploadPath, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.tempUploadPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/ /g, '_')}`)
});

module.exports = multer({ storage: storage }).single('file');
