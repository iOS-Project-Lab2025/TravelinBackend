/**
 * Global Error Handler Middleware
 * 
 * Catches all errors thrown in the application and formats them
 * according to the Amadeus API specification.
 * 
 * This should be the last middleware in the Express app.
 */

const { ApiError } = require('../utils/errors');

/**
 * Global error handler
 * 
 * @param {Error} err - Error object
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  // Log error for debugging
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    console.error('Error occurred:');
    console.error('  Message:', err.message);
    console.error('  Stack:', err.stack);
  } else {
    console.error('Error:', err.message);
  }

  // Handle custom API errors
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      errors: [err.toJSON()],
    });
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      status: 400,
      code: 477,
      title: 'INVALID FORMAT',
      detail: e.message,
      source: {
        parameter: e.path,
      },
    }));

    return res.status(400).json({ errors });
  }

  // Handle Sequelize database errors
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      errors: [
        {
          status: 500,
          code: 141,
          title: 'SYSTEM ERROR HAS OCCURRED',
          detail: isDevelopment ? err.message : 'A database error occurred',
        },
      ],
    });
  }

  // Handle Sequelize connection errors
  if (err.name === 'SequelizeConnectionError') {
    return res.status(500).json({
      errors: [
        {
          status: 500,
          code: 141,
          title: 'SYSTEM ERROR HAS OCCURRED',
          detail: 'Unable to connect to database',
        },
      ],
    });
  }

  // Handle generic errors (unexpected)
  const statusCode = err.statusCode || err.status || 500;
  const errorMessage = isDevelopment ? err.message : 'An unexpected error occurred';

  return res.status(statusCode).json({
    errors: [
      {
        status: statusCode,
        code: 141,
        title: 'SYSTEM ERROR HAS OCCURRED',
        detail: errorMessage,
      },
    ],
  });
}

/**
 * 404 Not Found handler for undefined routes
 * This should be added before the error handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    errors: [
      {
        status: 404,
        code: 1797,
        title: 'NOT FOUND',
        detail: `The requested resource '${req.path}' was not found`,
        source: {
          pointer: req.path,
        },
      },
    ],
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};

