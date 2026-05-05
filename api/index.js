const app = require('../backend/server.js');

module.exports = (req, res) => {
  try {
    return app(req, res);
  } catch (err) {
    console.error('SERVERLESS_FUNCTION_ERROR:', err);
    res.status(500).send('Internal Server Error: ' + err.message);
  }
};
