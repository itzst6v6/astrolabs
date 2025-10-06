// Persistent storage for serverless demo - uses JSON file to persist data
const fs = require('fs').promises;
const path = require('path');

const STORAGE_FILE = path.join(__dirname, '../../data/storage.json');

// In-memory cache for faster access
let storageCache = new Map();

const loadStorage = async () => {
  try {
    if (storageCache.size > 0) return storageCache;

    const data = await fs.readFile(STORAGE_FILE, 'utf8');
    const storage = JSON.parse(data);

    // Convert back to Map
    storageCache = new Map(Object.entries(storage));
    return storageCache;
  } catch (error) {
    // If file doesn't exist, start with empty storage
    storageCache = new Map();
    return storageCache;
  }
};

const saveStorage = async () => {
  try {
    // Ensure data directory exists
    await fs.mkdir(path.dirname(STORAGE_FILE), { recursive: true });

    // Convert Map to object for JSON serialization
    const storageObj = Object.fromEntries(storageCache);
    await fs.writeFile(STORAGE_FILE, JSON.stringify(storageObj, null, 2));
  } catch (error) {
    console.error('Error saving storage:', error);
    throw error;
  }
};

const processAndEncryptFile = async (publicToken, fileBuffer, originalName) => {
  try {
    // Load existing storage
    await loadStorage();

    // Encrypt the content
    const encryption = require('./encryption.service');
    const encrypted = encryption.encrypt(fileBuffer);

    // Convert encrypted buffer to base64 for JSON storage
    const encryptedBase64 = encrypted.toString('base64');

    // Store in persistent storage
    storageCache.set(publicToken, {
      encrypted: encryptedBase64,
      metadata: { original_filename: originalName },
      created_at: new Date().toISOString()
    });

    // Save to disk
    await saveStorage();

    return { success: true };
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
};

const retrieveAndDecryptFile = async (publicToken) => {
  try {
    // Load existing storage
    await loadStorage();

    // Check if file exists
    if (!storageCache.has(publicToken)) {
      throw new Error('File not found');
    }

    const stored = storageCache.get(publicToken);

    // Convert base64 back to buffer
    const encryptedBuffer = Buffer.from(stored.encrypted, 'base64');

    const encryption = require('./encryption.service');

    // Decrypt the content
    const decrypted = encryption.decrypt(encryptedBuffer);

    return {
      decryptedContent: decrypted,
      metadata: stored.metadata
    };
  } catch (error) {
    console.error('Error retrieving file:', error);
    throw error;
  }
};

module.exports = { processAndEncryptFile, retrieveAndDecryptFile };
