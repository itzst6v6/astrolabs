const { upload } = require('../../src/controllers/file.controller');

// Netlify function for file upload
exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // For Netlify, we need to handle the multipart form data
    // The event.body contains base64 encoded form data
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No file data provided' })
      };
    }

    // Decode the base64 body
    const bodyBuffer = Buffer.from(event.body, 'base64');

    // Generate a unique token for this upload
    const crypto = require('crypto');
    const publicToken = crypto.randomBytes(16).toString('hex');

    // Get content type to determine file extension
    const contentType = event.headers['content-type'] || '';
    let fileExtension = '.bin'; // Default binary

    if (contentType.includes('image/jpeg')) fileExtension = '.jpg';
    else if (contentType.includes('image/png')) fileExtension = '.png';
    else if (contentType.includes('image/gif')) fileExtension = '.gif';
    else if (contentType.includes('text/')) fileExtension = '.txt';
    else if (contentType.includes('application/pdf')) fileExtension = '.pdf';

    // Create filename with extension
    const originalName = `uploaded_file_${Date.now()}${fileExtension}`;

    // Import and use the file service
    const { processAndEncryptFile } = require('../../src/services/file.service');

    // Process and encrypt the file
    await processAndEncryptFile(publicToken, bodyBuffer, originalName);

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        publicToken: publicToken,
        filename: originalName,
        size: bodyBuffer.length
      })
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
