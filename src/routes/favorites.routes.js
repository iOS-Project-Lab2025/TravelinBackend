/**
 * Favorites Routes
 * 
 * Defines all favorites-related routes
 */

const express = require('express');
const router = express.Router();

// Import controllers
const FavoritesController = require('../controllers/FavoritesController');

// Import validation middleware
const { validateAddFavorite, validateGetFavorites } = require('../middleware/validation');

// Import authentication middleware
const { authenticate } = require('../middleware/auth');

/**
 * GET /favorites
 * Get all user's favorites (requires authentication)
 */
router.get('/', authenticate, validateGetFavorites, FavoritesController.getFavorites);

/**
 * POST /favorites
 * Add a POI to user's favorites (requires authentication)
 */
router.post('/', authenticate, validateAddFavorite, FavoritesController.addFavorite);

/**
 * GET /favorites/:poiId/check
 * Check if a POI is favorited (requires authentication)
 * IMPORTANT: This route must come BEFORE /favorites/:poiId
 */
router.get('/:poiId/check', authenticate, FavoritesController.checkFavorite);

/**
 * DELETE /favorites/:poiId
 * Remove a POI from user's favorites (requires authentication)
 */
router.delete('/:poiId', authenticate, FavoritesController.removeFavorite);

module.exports = router;

