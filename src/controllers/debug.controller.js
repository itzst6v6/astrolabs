// Debug endpoint to check platform configuration
const config = require('../config');

const getPlatformInfo = (req, res) => {
  res.json({
    platform: config.platform,
    platformName: config.platformName,
    limits: {
      fileSize: config.maxFileSize,
      fileSizeBytes: config.fileSizeLimit
    },
    storage: {
      type: config.storageType,
      persistent: config.features.persistentStorage
    },
    features: config.features,
    environment: {
      isProduction: config.isProduction,
      isVercel: config.isVercel,
      isNetlify: config.isNetlify,
      isDevelopment: config.isDevelopment
    }
  });
};

module.exports = { getPlatformInfo };
