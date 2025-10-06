const app = require('./app');
const config = require('./config');

const port = config.port;

app.listen(port, () => {
  console.log(`Server v4 is running securely on http://localhost:${port}`);
});
