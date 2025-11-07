/**
 * Authentication Routes
 * 
 * Defines all authentication-related routes
 */

const express = require('express');
const router = express.Router();

// Import controllers
const AuthController = require('../controllers/AuthController');

// Import validation middleware
const { validateRegister, validateLogin } = require('../middleware/validation');

// Import authentication middleware
const { authenticate } = require('../middleware/auth');

/**
 * POST /register
 * Register a new user
 */
router.post('/register', validateRegister, AuthController.register);

/**
 * POST /login
 * Login user and get JWT token
 */
router.post('/login', validateLogin, AuthController.login);

/**
 * GET /me
 * Get current user profile (requires authentication)
 */
router.get('/me', authenticate, AuthController.getMe);

module.exports = router;

