const crypto = require('crypto');

module.exports = { generatePublicToken: () => crypto.randomBytes(12).toString('hex') };
