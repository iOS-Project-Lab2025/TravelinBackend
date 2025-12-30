const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');
const {
  ValidationError,
  NotFoundError,
  InvalidDataError,
  UnauthorizedError,
} = require('../utils/errors');
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
   * @param {string} [userData.phone] - User phone number
   * @returns {Promise<object>} Created user (without password)
   */
  static async register(userData) {
    const { email, password, firstName, lastName, phone } = userData;

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
      phone,
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

    // 1. Generamos ambos tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: user.toPublicJSON(),
      accessToken,
      refreshToken,
    };
  }

  // 2. Método para renovar token
  static async refreshToken(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    try {
      // Verificar el Refresh Token usando nuestro secreto
      const secret = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';
      const decoded = jwt.verify(incomingRefreshToken, secret);

      const user = await User.findByPk(decoded.id);
      if (!user) throw new NotFoundError('User not found');

      // Generar nuevo Access Token (de 30s)
      const newAccessToken = this.generateAccessToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: incomingRefreshToken,
      };
    } catch (error) {
      throw new ValidationError('Invalid or expired refresh token');
    }
  }

  // 3. NUEVO: Token corto (30 segundos para la DEMO)
  static generateAccessToken(user) {
    const payload = { id: user.id, email: user.email, type: 'access' };
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    return jwt.sign(payload, secret, { expiresIn: '30s' });
  }

  // 4. NUEVO: Token largo
  static generateRefreshToken(user) {
    const payload = { id: user.id, email: user.email, type: 'refresh' };
    const secret = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';
    return jwt.sign(payload, secret, { expiresIn: '7d' });
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
      throw new UnauthorizedError('Token is required');
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    try {
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid token');
      }
      throw new UnauthorizedError('Token verification failed');
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

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {object} updateData - Fields to update
   * @param {string} [updateData.email] - New email
   * @param {string} [updateData.password] - New password
   * @param {string} [updateData.firstName] - New first name
   * @param {string} [updateData.lastName] - New last name
   * @param {string} [updateData.phone] - New phone
   * @returns {Promise<object>} Updated user (without password)
   */
  static async updateUser(userId, updateData) {
    const { email, password, firstName, lastName, phone } = updateData;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if email is being updated and if it's already taken
    if (email !== undefined && email !== null) {
      const existingUser = await User.findOne({
        where: {
          email: email.trim(),
          id: { [Op.ne]: userId }, // Exclude current user
        },
      });

      if (existingUser) {
        throw new ValidationError('Email is already in use', {
          parameter: 'email',
        });
      }

      user.email = email.trim();
    }

    // Update other fields if provided
    if (firstName !== undefined) {
      user.firstName = firstName || null;
    }
    if (lastName !== undefined) {
      user.lastName = lastName || null;
    }
    if (phone !== undefined) {
      user.phone = phone || null;
    }
    if (password !== undefined && password !== null) {
      user.password = password; // Will be hashed by model hook
    }

    // Save changes
    await user.save();

    return user.toPublicJSON();
  }

  /**
   * Delete user account
   * @param {number} userId - User ID
   * @returns {Promise<object>} Success confirmation
   */
  static async deleteUser(userId) {
    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Delete user (CASCADE will handle related data: favorites, bookings)
    await user.destroy();

    return { success: true };
  }
}

module.exports = AuthService;
