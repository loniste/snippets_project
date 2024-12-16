// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
    console.error('Server Error:', err);
    res.status(500).send('Internal Server Error');
  }
  
  module.exports = errorHandler;