const { UserFavorite, PointOfInterest, User } = require('../models');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Favorites Service
 * Handles user favorites operations
 */
class FavoritesService {
  /**
   * Add a POI to user's favorites
   * @param {number} userId - User ID
   * @param {string} poiId - Point of Interest ID
   * @returns {Promise<object>} Created favorite record
   */
  static async addFavorite(userId, poiId) {
    // Verify POI exists
    const poi = await PointOfInterest.findByPk(poiId);
    if (!poi) {
      throw new NotFoundError('Point of Interest not found', {
        parameter: 'poiId',
      });
    }

    // Check if already favorited
    const existing = await UserFavorite.findOne({
      where: { userId, poiId },
    });

    if (existing) {
      throw new ValidationError('POI is already in favorites', {
        parameter: 'poiId',
      });
    }

    // Create favorite
    const favorite = await UserFavorite.create({
      userId,
      poiId,
    });

    return favorite;
  }

  /**
   * Remove a POI from user's favorites
   * @param {number} userId - User ID
   * @param {string} poiId - Point of Interest ID
   * @returns {Promise<boolean>} True if removed, false if not found
   */
  static async removeFavorite(userId, poiId) {
    const favorite = await UserFavorite.findOne({
      where: { userId, poiId },
    });

    if (!favorite) {
      throw new NotFoundError('Favorite not found', {
        parameter: 'poiId',
      });
    }

    await favorite.destroy();
    return true;
  }

  /**
   * Get all favorites for a user
   * @param {number} userId - User ID
   * @param {object} options - Query options (limit, offset)
   * @returns {Promise<object>} Favorites with POI data
   */
  static async getUserFavorites(userId, options = {}) {
    const { limit = 10, offset = 0 } = options;

    const { count, rows } = await UserFavorite.findAndCountAll({
      where: { userId },
      include: [
        {
          model: PointOfInterest,
          as: 'poi',
          required: true,
        },
      ],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['createdAt', 'DESC']],
    });

    return {
      count,
      rows: rows.map((favorite) => ({
        id: favorite.id,
        poi: favorite.poi.toPublicJSON(process.env.BASE_URL || 'http://localhost:3000'),
        createdAt: favorite.createdAt,
      })),
    };
  }

  /**
   * Check if a POI is favorited by user
   * @param {number} userId - User ID
   * @param {string} poiId - Point of Interest ID
   * @returns {Promise<boolean>} True if favorited
   */
  static async isFavorited(userId, poiId) {
    if (!userId) {
      return false;
    }

    const favorite = await UserFavorite.findOne({
      where: { userId, poiId },
    });

    return !!favorite;
  }

  /**
   * Get favorite count for a POI
   * @param {string} poiId - Point of Interest ID
   * @returns {Promise<number>} Number of users who favorited this POI
   */
  static async getFavoriteCount(poiId) {
    const count = await UserFavorite.count({
      where: { poiId },
    });

    return count;
  }
}

module.exports = FavoritesService;

