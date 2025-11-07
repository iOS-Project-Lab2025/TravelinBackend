const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ValidationError, NotFoundError, InvalidDataError } = require('../utils/errors');
const config = require('../config');

/**
 * Authentication Service
 * Handles user registration, login, and JWT token generation
 */
class AuthService {
  /**
   * Register a new user
   * @param {object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} [userData.firstName] - User first name
   * @param {string} [userData.lastName] - User last name
   * @returns {Promise<object>} Created user (without password)
   */
  static async register(userData) {
    const { email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ValidationError('User with this email already exists', {
        parameter: 'email',
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password, // Will be hashed by model hook
      firstName,
      lastName,
    });

    return user.toPublicJSON();
  }

  /**
   * Authenticate user and generate JWT token
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} User data and JWT token
   */
  static async login(email, password) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required', {
        parameter: email ? 'password' : 'email',
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new InvalidDataError('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      throw new InvalidDataError('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: user.toPublicJSON(),
      token,
    };
  }

  /**
   * Generate JWT token for user
   * @param {object} user - User instance
   * @returns {string} JWT token
   */
  static generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
    };

    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Promise<object>} Decoded token payload
   */
  static async verifyToken(token) {
    if (!token) {
      throw new ValidationError('Token is required');
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    try {
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new ValidationError('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new ValidationError('Invalid token');
      }
      throw new ValidationError('Token verification failed');
    }
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<object>} User data (without password)
   */
  static async getUserById(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user.toPublicJSON();
  }
}

module.exports = AuthService;

