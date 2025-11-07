const FavoritesService = require('../services/FavoritesService');
const { formatLocationCollection, buildPaginationMeta } = require('../utils/responseFormatter');
const config = require('../config');

/**
 * Favorites Controller
 * Handles user favorites operations
 */
class FavoritesController {
  /**
   * Add a POI to user's favorites
   * POST /favorites
   */
  static async addFavorite(req, res, next) {
    try {
      const userId = req.userId;
      const { poiId } = req.body;

      await FavoritesService.addFavorite(userId, poiId);

      // Get the POI to return in response
      const { PointOfInterest } = require('../models');
      const poi = await PointOfInterest.findByPk(poiId);

      res.status(201).json({
        data: {
          message: 'POI added to favorites',
          poi: poi.toPublicJSON(config.baseUrl),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove a POI from user's favorites
   * DELETE /favorites/:poiId
   */
  static async removeFavorite(req, res, next) {
    try {
      const userId = req.userId;
      const { poiId } = req.params;

      await FavoritesService.removeFavorite(userId, poiId);

      res.status(200).json({
        data: {
          message: 'POI removed from favorites',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all user's favorites
   * GET /favorites
   */
  static async getFavorites(req, res, next) {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query['page[limit]'] || config.api.defaultLimit, 10);
      const offset = parseInt(req.query['page[offset]'] || 0, 10);

      const result = await FavoritesService.getUserFavorites(userId, {
        limit,
        offset,
      });

      // Format response
      const formattedPois = result.rows.map((item) => item.poi);

      // Build pagination meta
      const meta = buildPaginationMeta(
        config.baseUrl,
        '/v1/favorites',
        req.query,
        result.count,
        limit,
        offset
      );

      res.status(200).json({
        data: formattedPois,
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if a POI is favorited
   * GET /favorites/:poiId/check
   */
  static async checkFavorite(req, res, next) {
    try {
      const userId = req.userId;
      const { poiId } = req.params;

      const isFavorited = await FavoritesService.isFavorited(userId, poiId);

      res.status(200).json({
        data: {
          poiId,
          isFavorited,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FavoritesController;

