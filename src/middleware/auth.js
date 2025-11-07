const { ValidationError } = require('../utils/errors');
const AuthService = require('../services/AuthService');
const { User } = require('../models');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request object
 */

/**
 * Extract token from Authorization header
 * @param {object} req - Express request object
 * @returns {string|null} JWT token or null
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  // Check for "Bearer <token>" format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Middleware to authenticate requests using JWT
 * Attaches user to req.user if token is valid
 */
async function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header
    const token = extractToken(req);

    if (!token) {
      throw new ValidationError('Authentication token is required', {
        parameter: 'Authorization',
      });
    }

    // Verify token
    const decoded = await AuthService.verifyToken(token);

    // Get user from database
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't fail if missing
 */
async function optionalAuthenticate(req, res, next) {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = await AuthService.verifyToken(token);
      const user = await User.findByPk(decoded.id);
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
}

module.exports = {
  authenticate,
  optionalAuthenticate,
};

