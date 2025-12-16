/**
 * Point of Interest Controller
 * 
 * Handles HTTP requests for POI endpoints:
 * - GET /pois - Search by radius
 * - GET /pois/by-square - Search by bounding box
 * - GET /pois/:poisId - Get by ID
 */

const PoiService = require('../services/PoiService');
const {
  formatCollectionResponse,
  formatSingleResponse,
  formatValidationError,
  formatNotFoundError,
  formatSystemError,
} = require('../utils/responseFormatter');

/**
 * GET /v1/reference-data/locations/pois
 * Search for POIs within a radius from a center point
 * 
 * Query Parameters:
 * - latitude (required): Center point latitude
 * - longitude (required): Center point longitude
 * - radius (optional): Search radius in km (0-20, default: 1)
 * - categories (optional): Array of category filters
 * - page[limit] (optional): Results per page (default: 10, max: 100)
 * - page[offset] (optional): Number of results to skip (default: 0)
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
async function getPointsOfInterest(req, res, next) {
  try {
    // Extract and validate required parameters
    const latitude = parseFloat(req.query.latitude);
    const longitude = parseFloat(req.query.longitude);
    
    // Extract optional parameters with defaults
    const radius = req.query.radius ? parseInt(req.query.radius) : 1;
    const limit = req.query['page[limit]'] ? parseInt(req.query['page[limit]']) : 10;
    const offset = req.query['page[offset]'] ? parseInt(req.query['page[offset]']) : 0;
    
    // Extract categories (can be array or single value)
    let categories = null;
    if (req.query.categories) {
      if (Array.isArray(req.query.categories)) {
        categories = req.query.categories;
      } else if (typeof req.query.categories === 'string') {
        // Handle comma-separated string or single value
        categories = req.query.categories.split(',').map(c => c.trim());
      }
    }

    // Call service layer
    const { rows: pois, count: totalCount } = await PoiService.findByRadius(
      latitude,
      longitude,
      radius,
      categories,
      limit,
      offset
    );

    // Get base URL from environment or construct from request
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const path = '/v1/reference-data/locations/pois';

    // Format response with pagination metadata
    const response = formatCollectionResponse(
      pois,
      baseUrl,
      path,
      req.query,
      totalCount,
      limit,
      offset
    );

    // Return 200 OK with data
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getPointsOfInterest:', error.message);
    next(error);
  }
}

/**
 * GET /v1/reference-data/locations/pois/by-name
 * Search for POIs by name (case-insensitive partial match)
 * 
 * Query Parameters:
 * - name (required): Search string for POI name
 * - categories (optional): Array of category filters
 * - page[limit] (optional): Results per page (default: 10, max: 100)
 * - page[offset] (optional): Number of results to skip (default: 0)
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
async function getPointsOfInterestByName(req, res, next) {
  try {
    // Extract and validate required parameters
    const name = req.query.name;
    
    // Extract optional parameters with defaults
    const limit = req.query['page[limit]'] ? parseInt(req.query['page[limit]']) : 10;
    const offset = req.query['page[offset]'] ? parseInt(req.query['page[offset]']) : 0;
    
    // Extract categories (can be array or single value)
    let categories = null;
    if (req.query.categories) {
      if (Array.isArray(req.query.categories)) {
        categories = req.query.categories;
      } else if (typeof req.query.categories === 'string') {
        // Handle comma-separated string or single value
        categories = req.query.categories.split(',').map(c => c.trim());
      }
    }

    // Call service layer
    const { rows: pois, count: totalCount } = await PoiService.findByName(
      name,
      categories,
      limit,
      offset
    );

    // Get base URL from environment or construct from request
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const path = '/v1/reference-data/locations/pois/by-name';

    // Format response with pagination metadata
    const response = formatCollectionResponse(
      pois,
      baseUrl,
      path,
      req.query,
      totalCount,
      limit,
      offset
    );

    // Return 200 OK with data
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getPointsOfInterestByName:', error.message);
    next(error);
  }
}

/**
 * GET /v1/reference-data/locations/pois/:poisId
 * Get a single POI by ID
 * 
 * Path Parameters:
 * - poisId (required): POI unique identifier
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
async function getPointOfInterest(req, res, next) {
  try {
    // Extract POI ID from path parameters
    const { poisId } = req.params;

    // Call service layer
    const poi = await PoiService.findById(poisId);

    // Check if POI exists
    if (!poi) {
      const error = formatNotFoundError('POI', poisId);
      return res.status(404).json(error);
    }

    // Get base URL
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    // Format response
    const response = formatSingleResponse(poi, baseUrl);

    // Return 200 OK with data
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getPointOfInterest:', error.message);
    next(error);
  }
}

/**
 * GET /v1/reference-data/locations/pois/by-square
 * Search for POIs within a rectangular bounding box
 * 
 * Query Parameters:
 * - north (required): North boundary latitude
 * - south (required): South boundary latitude
 * - east (required): East boundary longitude
 * - west (required): West boundary longitude
 * - categories (optional): Array of category filters
 * - page[limit] (optional): Results per page (default: 10, max: 100)
 * - page[offset] (optional): Number of results to skip (default: 0)
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
async function getPointsOfInterestBySquare(req, res, next) {
  try {
    // Extract and validate required parameters
    const north = parseFloat(req.query.north);
    const south = parseFloat(req.query.south);
    const east = parseFloat(req.query.east);
    const west = parseFloat(req.query.west);

    // Extract optional parameters with defaults
    const limit = req.query['page[limit]'] ? parseInt(req.query['page[limit]']) : 10;
    const offset = req.query['page[offset]'] ? parseInt(req.query['page[offset]']) : 0;

    // Extract categories
    let categories = null;
    if (req.query.categories) {
      if (Array.isArray(req.query.categories)) {
        categories = req.query.categories;
      } else if (typeof req.query.categories === 'string') {
        categories = req.query.categories.split(',').map(c => c.trim());
      }
    }

    // Call service layer
    const { rows: pois, count: totalCount } = await PoiService.findByBoundingBox(
      north,
      south,
      east,
      west,
      categories,
      limit,
      offset
    );

    // Get base URL
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const path = '/v1/reference-data/locations/pois/by-square';

    // Format response with pagination metadata
    const response = formatCollectionResponse(
      pois,
      baseUrl,
      path,
      req.query,
      totalCount,
      limit,
      offset
    );

    // Return 200 OK with data
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getPointsOfInterestBySquare:', error.message);
    next(error);
  }
}

module.exports = {
  getPointsOfInterest,
  getPointOfInterest,
  getPointsOfInterestBySquare,
  getPointsOfInterestByName,
};

