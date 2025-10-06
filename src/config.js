// Platform-aware configuration for different hosting environments
const path = require('path');

// Manual platform override via DEPLOY_PLATFORM environment variable
// Options: local, unknownHoster, vercel, netlify
const getManualPlatform = () => {
  const manualPlatform = process.env.DEPLOY_PLATFORM;
  if (manualPlatform && ['local', 'unknownHoster', 'vercel', 'netlify'].includes(manualPlatform)) {
    return manualPlatform;
  }
  return null;
};

// Detect current platform (with manual override support)
const detectPlatform = () => {
  // Check for manual override first
  const manualPlatform = getManualPlatform();
  if (manualPlatform) {
    return manualPlatform;
  }

  // Auto-detection if no manual override
  if (process.env.VERCEL) {
    return 'vercel';
  }
  if (process.env.NETLIFY) {
    return 'netlify';
  }
  if (process.env.NODE_ENV === 'production') {
    return 'unknownHoster'; // Default for unknown production environments
  }
  return 'local'; // Default for development
};

// Platform-specific configurations
const platformConfigs = {
  local: {
    name: 'Local Development',
    fileSizeLimit: 50 * 1024 * 1024, // 50MB (generous for testing)
    maxFileSize: '50MB',
    storageType: 'persistent_json',
    apiBasePath: '/api',
    features: {
      persistentStorage: true,
      largeFiles: true,
      customDomains: false
    }
  },
  unknownHoster: {
    name: 'Unknown Production Host',
    fileSizeLimit: 4 * 1024 * 1024, // 4MB (conservative)
    maxFileSize: '4MB',
    storageType: 'memory',
    apiBasePath: '/api',
    features: {
      persistentStorage: false,
      largeFiles: false,
      customDomains: true
    }
  },
  vercel: {
    name: 'Vercel',
    fileSizeLimit: 4 * 1024 * 1024, // 4MB (safe limit)
    maxFileSize: '4MB',
    storageType: 'memory', // Vercel serverless limitations
    apiBasePath: '/api',
    features: {
      persistentStorage: false,
      largeFiles: false,
      customDomains: true
    }
  },
  netlify: {
    name: 'Netlify',
    fileSizeLimit: 9 * 1024 * 1024, // 9MB (more generous)
    maxFileSize: '9MB',
    storageType: 'persistent_json', // Can use file system
    apiBasePath: '/.netlify/functions',
    features: {
      persistentStorage: true,
      largeFiles: true,
      customDomains: true
    }
  }
};

const currentPlatform = detectPlatform();
const config = platformConfigs[currentPlatform];

module.exports = {
  // Platform detection
  platform: currentPlatform,
  platformName: config.name,

  // File handling
  fileSizeLimit: config.fileSizeLimit,
  maxFileSize: config.maxFileSize,
  storageType: config.storageType,

  // API configuration
  apiBasePath: config.apiBasePath,

  // Paths
  vaultPath: path.join(__dirname, '../storage'),
  tempUploadPath: path.join(__dirname, '../storage/temp_uploads'),
  dataPath: path.join(__dirname, '../data'),
  port: process.env.PORT || 3000,

  // Features
  features: config.features,

  // Environment info
  isProduction: process.env.NODE_ENV === 'production',
  isVercel: !!process.env.VERCEL || currentPlatform === 'vercel',
  isNetlify: !!process.env.NETLIFY || currentPlatform === 'netlify',
  isLocal: currentPlatform === 'local',
  isUnknownHoster: currentPlatform === 'unknownHoster',

  // Manual override info
  manualOverride: getManualPlatform(),
  autoDetected: !getManualPlatform(),

  // Helper functions
  getFileSizeLimit: () => config.fileSizeLimit,
  getMaxFileSize: () => config.maxFileSize,
  getApiBasePath: () => config.apiBasePath,
  getStorageType: () => config.storageType,

  // Platform-specific settings
  getPlatformInfo: () => ({
    name: config.name,
    limits: {
      fileSize: config.maxFileSize,
      fileSizeBytes: config.fileSizeLimit,
      storage: config.storageType
    },
    features: config.features,
    override: getManualPlatform()
  }),

  // Quick platform checks
  isPlatform: (platform) => currentPlatform === platform,
  hasFeature: (feature) => config.features[feature] || false
};
