const AuthService = require('../services/AuthService');
const { InternalServerError } = require('../utils/errors');

/**
 * Authentication Controller
 * Handles user registration and login
 */
class AuthController {
  /**
   * Register a new user
   * POST /auth/register
   */
  static async register(req, res, next) {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      const user = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        phone,
      });

      // Generate token for newly registered user
      const token = AuthService.generateToken({ id: user.id, email: user.email });

      res.status(201).json({
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /auth/me
   */
  static async getMe(req, res, next) {
    try {
      // User is attached by authenticate middleware
      if (!req.user) {
        throw new InternalServerError('User not found in request');
      }

      res.status(200).json({
        data: {
          user: req.user.toPublicJSON(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);
      
      res.status(200).json({
        data: result // devolverá { accessToken, refreshToken }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PATCH /auth/me
   */
  static async updateProfile(req, res, next) {
    try {
      const userId = req.userId;
      const { email, password, firstName, lastName, phone } = req.body;

      const updatedUser = await AuthService.updateUser(userId, {
        email,
        password,
        firstName,
        lastName,
        phone,
      });

      res.status(200).json({
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user account
   * DELETE /auth/me
   */
  static async deleteAccount(req, res, next) {
    try {
      const userId = req.userId;

      await AuthService.deleteUser(userId);

      res.status(200).json({
        data: {
          message: 'Account deleted successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;

