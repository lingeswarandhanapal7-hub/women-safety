const logger = require('../utils/logger')

module.exports = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, url: req.url })
  const status = err.statusCode || 500
  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message,
    code: status
  })
}
