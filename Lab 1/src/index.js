// src/index.js
const app = require('./app');
const logger = require('./logger');

const port = process.env.PORT || 8080;

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});
