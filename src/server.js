const app = require('./app');
const config = require('./config');

// For Vercel serverless deployment, export the app directly
// instead of listening on a port
module.exports = app;

// For local development, only listen if not in serverless environment
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  const port = config.port || 80;
  app.listen(port, () => {
    console.log(`Server v4 is running securely on http://localhost:${port}`);
  });
}
