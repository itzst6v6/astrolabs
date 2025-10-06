const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const encryption = require('./encryption.service');
const metadata = require('../data/metadata.manager');

const processAndEncryptFile = async (publicToken, tempPath, originalName) => {
  const vaultDir = path.join(config.vaultPath, publicToken);
  await fs.mkdir(vaultDir, { recursive: true });
  const fileContent = await fs.readFile(tempPath);
  const encrypted = encryption.encrypt(fileContent);
  await fs.writeFile(path.join(vaultDir, 'data.enc'), encrypted);
  await metadata.writeMetadata(vaultDir, { original_filename: originalName });
  await fs.unlink(tempPath);
};

const retrieveAndDecryptFile = async (publicToken) => {
  const vaultDir = path.join(config.vaultPath, publicToken);
  const encrypted = await fs.readFile(path.join(vaultDir, 'data.enc'));
  const meta = await metadata.readMetadata(vaultDir);
  const decrypted = encryption.decrypt(encrypted);
  return { decryptedContent: decrypted, metadata: meta };
};

module.exports = { processAndEncryptFile, retrieveAndDecryptFile };
