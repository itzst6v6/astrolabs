// In-memory storage for serverless demo (replaces file system operations)
const memoryStorage = new Map();

const processAndEncryptFile = async (publicToken, tempPath, originalName) => {
  try {
    // For serverless demo, we'll simulate file storage in memory
    // In production, you'd use cloud storage like AWS S3
    const fs = require('fs').promises;

    // Read the uploaded file (this works in serverless for the initial upload)
    const fileContent = await fs.readFile(tempPath);

    // Encrypt the content
    const encryption = require('./encryption.service');
    const encrypted = encryption.encrypt(fileContent);

    // Store in memory (for demo purposes)
    memoryStorage.set(publicToken, {
      encrypted: encrypted,
      metadata: { original_filename: originalName }
    });

    // Clean up temp file
    await fs.unlink(tempPath);

    return { success: true };
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
};

const retrieveAndDecryptFile = async (publicToken) => {
  try {
    // Check if file exists in memory storage
    if (!memoryStorage.has(publicToken)) {
      throw new Error('File not found');
    }

    const stored = memoryStorage.get(publicToken);
    const encryption = require('./encryption.service');

    // Decrypt the content
    const decrypted = encryption.decrypt(stored.encrypted);

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
