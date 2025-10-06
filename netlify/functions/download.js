// Netlify function for file download
// This handles the download endpoint: /api/v2/download/:token
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

  // Only allow GET requests for downloads
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Extract token from path
    const pathSegments = event.path.split('/');
    const tokenIndex = pathSegments.indexOf('download');
    const publicToken = pathSegments[tokenIndex + 1];

    if (!publicToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Token required' })
      };
    }

    // Import the file controller (this might need adjustment for Netlify)
    const { retrieveAndDecryptFile } = require('../../src/services/file.service');

    const { decryptedContent, metadata } = await retrieveAndDecryptFile(publicToken);

    // Return the file
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Disposition': `attachment; filename="${metadata.original_filename}"`,
        'Content-Type': 'application/octet-stream'
      },
      body: decryptedContent.toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error('Download error:', error);

    // Redirect to file not found page for 404 errors
    if (error.message === 'File not found') {
      return {
        statusCode: 302,
        headers: {
          ...headers,
          'Location': '/file-not-found.html'
        },
        body: ''
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
