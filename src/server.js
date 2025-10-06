const app = require('./app');
const config = require('./config');

// Log current platform configuration
console.log(`🚀 AstroLab Vault starting on platform: ${config.platformName}`);
console.log(`📏 File size limit: ${config.maxFileSize}`);
console.log(`💾 Storage type: ${config.storageType}`);
console.log(`🔗 API base path: ${config.apiBasePath}`);
console.log(`✨ Features: Persistent=${config.features.persistentStorage}, LargeFiles=${config.features.largeFiles}`);

if (config.manualOverride) {
  console.log(`Manual override active: DEPLOY_PLATFORM=${config.manualOverride}`);
} else {
  console.log(`Auto-detected platform`);
}

// For Vercel serverless deployment, export the app directly
// instead of listening on a port
module.exports = app;

// For local development, only listen if not in serverless environment
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '0') {
  const port = config.port || 8072;
  app.listen(port, () => {
    console.log(`Server v4 is running securely on http://localhost:${port}`);
  });
}
