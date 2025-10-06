// Remove session middleware and authentication
const express = require('express');
const path = require('path');
const mainRouter = require('./routes');

const app = express();

app.use(express.json());

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Mount the main router for all API requests
app.use('/api', mainRouter);

// Serve the main application page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Catch-all handler: serve 404 page for any unmatched routes
app.get('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public', '404.html'));
});

module.exports = app;
