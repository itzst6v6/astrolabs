// Platform-aware configuration for different hosting environments
const path = require('path');

// Detect current platform
const detectPlatform = () => {
  if (process.env.VERCEL) {
    return 'vercel';
  }
  if (process.env.NETLIFY) {
    return 'netlify';
  }
  if (process.env.NODE_ENV === 'production') {
    return 'unknown_production';
  }
  return 'development';
};

// Platform-specific configurations
const platformConfigs = {
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
  },
  unknown_production: {
    name: 'Production',
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
  development: {
    name: 'Development',
    fileSizeLimit: 50 * 1024 * 1024, // 50MB (generous for testing)
    maxFileSize: '50MB',
    storageType: 'persistent_json',
    apiBasePath: '/api',
    features: {
      persistentStorage: true,
      largeFiles: true,
      customDomains: false
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
  isVercel: !!process.env.VERCEL,
  isNetlify: !!process.env.NETLIFY,
  isDevelopment: currentPlatform === 'development',

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
      storage: config.storageType
    },
    features: config.features
  })
};
