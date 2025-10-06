// Persistent storage for serverless demo - uses JSON file to persist data
const fs = require('fs').promises;
const path = require('path');
const encryption = require('./encryption.service'); // Moved to top-level

const STORAGE_FILE = path.join(__dirname, '../../data/storage.json');

// In-memory cache for faster access
let storageCache = new Map();

const loadStorage = async () => {
  try {
    // If cache is already populated, return it to avoid unnecessary file reads
    if (storageCache.size > 0) return storageCache;

    const data = await fs.readFile(STORAGE_FILE, 'utf8');
    const storage = JSON.parse(data);

    // Convert the loaded object back to a Map
    storageCache = new Map(Object.entries(storage));
    return storageCache;
  } catch (error) {
    // If the file doesn't exist or is empty, start with a new Map
    if (error.code === 'ENOENT') {
        storageCache = new Map();
        return storageCache;
    }
    // Re-throw other errors
    throw error;
  }
};

const saveStorage = async () => {
  // FIXED: Added the missing 'try' block.
  try {
    // Ensure the data directory exists before writing the file
    await fs.mkdir(path.dirname(STORAGE_FILE), { recursive: true });

    // Convert the Map to a plain object for JSON serialization
    const storageObj = Object.fromEntries(storageCache);
    await fs.writeFile(STORAGE_FILE, JSON.stringify(storageObj, null, 2));
  } catch (error) {
    console.error('Error saving storage:', error);
    throw error;
  }
};

const processAndEncryptFile = async (publicToken, fileBuffer, originalName) => {
  try {
    // Load existing storage into the cache
    await loadStorage();

    // Encrypt the file content
    const encrypted = encryption.encrypt(fileBuffer);

    // Convert the encrypted buffer to a base64 string for JSON compatibility
    const encryptedBase64 = encrypted.toString('base64');

    // Store the encrypted data and metadata in the cache
    storageCache.set(publicToken, {
      encrypted: encryptedBase64,
      metadata: { original_filename: originalName },
      created_at: new Date().toISOString()
    });

    // Persist the updated cache to the JSON file
    await saveStorage();

    return { success: true };
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
};

// FIXED: Implemented the missing retrieveAndDecryptFile function.
const retrieveAndDecryptFile = async (publicToken) => {
    try {
        // Load storage into the cache
        await loadStorage();

        // Check if the file exists in the cache
        if (!storageCache.has(publicToken)) {
            return null; // Return null if file not found
        }

        const storedFile = storageCache.get(publicToken);

        // Convert the base64 string back to a buffer
        const encryptedBuffer = Buffer.from(storedFile.encrypted, 'base64');

        // Decrypt the buffer
        const decrypted = encryption.decrypt(encryptedBuffer);

        return {
            decrypted,
            metadata: storedFile.metadata
        };
    } catch (error) {
        console.error('Error retrieving and decrypting file:', error);
        throw error;
    }
};


const deleteFile = async (publicToken) => {
  try {
    // Load storage into the cache
    await loadStorage();

    // Check if the file exists before attempting to delete
    if (!storageCache.has(publicToken)) {
      throw new Error('File not found');
    }

    // Remove the file from the in-memory cache
    storageCache.delete(publicToken);

    // Persist the updated cache to the file
    await saveStorage();

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

module.exports = { processAndEncryptFile, retrieveAndDecryptFile, deleteFile };