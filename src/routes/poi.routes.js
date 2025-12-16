/**
 * Point of Interest Routes
 * 
 * Defines all POI-related routes with validation middleware
 */

const express = require('express');
const router = express.Router();

// Import controllers
const {
  getPointsOfInterest,
  getPointOfInterest,
  getPointsOfInterestBySquare,
  getPointsOfInterestByName,
} = require('../controllers/PoiController');

// Import validation middleware
const {
  validateGetPois,
  validateGetPoisBySquare,
  validateGetPoisByName,
  validateGetPoiById,
} = require('../middleware/validation');

/**
 * GET /pois/by-square
 * Search POIs within a rectangular bounding box
 * 
 * IMPORTANT: This route must come BEFORE /pois/:poisId
 * Otherwise Express will match "by-square" as a poisId parameter
 */
router.get('/by-square', validateGetPoisBySquare, getPointsOfInterestBySquare);

/**
 * GET /pois/by-name
 * Search POIs by name (case-insensitive partial match)
 * 
 * IMPORTANT: This route must come BEFORE /pois/:poisId
 * Otherwise Express will match "by-name" as a poisId parameter
 */
router.get('/by-name', validateGetPoisByName, getPointsOfInterestByName);

/**
 * GET /pois/:poisId
 * Get a single POI by ID
 */
router.get('/:poisId', validateGetPoiById, getPointOfInterest);

/**
 * GET /pois
 * Search POIs within a radius from a center point
 * 
 * This route must come AFTER the specific routes above
 */
router.get('/', validateGetPois, getPointsOfInterest);

module.exports = router;

