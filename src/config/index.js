const path = require('path');

module.exports = {
  port: process.env.PORT || 3000,
  vaultPath: path.join(__dirname, '../../storage/vault'),
  tempUploadPath: path.join(__dirname, '../../storage/temp_uploads')
};
