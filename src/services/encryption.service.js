const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
// Use a hardcoded key for encryption
const KEY = crypto.createHash('sha256').update('my-secret-key-for-encryption').digest('base64').substr(0, 32);

const encrypt = (buffer) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, encrypted]);
};

const decrypt = (encryptedBuffer) => {
  const iv = encryptedBuffer.slice(0, IV_LENGTH);
  const encryptedData = encryptedBuffer.slice(IV_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  return decrypted;
};

module.exports = {
  encrypt,
  decrypt,
};
