/**
 * POI Service Layer
 * 
 * Business logic for Point of Interest operations including:
 * - Search by radius (circular area)
 * - Search by bounding box (rectangular area)
 * - Get by ID
 * - Filtering and pagination
 */

const { PointOfInterest } = require('../models');
const { Op } = require('sequelize');
const {
  calculateDistance,
  getBoundingBox,
  isInBoundingBox,
  isValidCoordinate,
} = require('../utils/geospatial');

/**
 * Find POIs within a radius from a center point
 * 
 * Strategy:
 * 1. Calculate a bounding box that fully contains the search circle
 * 2. Query POIs within the bounding box (efficient with DB index)
 * 3. Filter results by actual Haversine distance
 * 4. Apply category filter and pagination
 * 5. Order by rank ASC, then name ASC
 * 
 * @param {number} latitude - Center point latitude
 * @param {number} longitude - Center point longitude
 * @param {number} radius - Search radius in kilometers (0-20)
 * @param {Array<string>} categories - Optional array of category filters
 * @param {number} limit - Number of results per page (default: 10)
 * @param {number} offset - Number of results to skip (default: 0)
 * @returns {Promise<{rows: Array, count: number}>} POIs and total count
 */
async function findByRadius(
  latitude,
  longitude,
  radius = 1,
  categories = null,
  limit = 10,
  offset = 0
) {
  try {
    // Validate coordinates
    if (!isValidCoordinate(latitude, longitude)) {
      throw new Error(`Invalid coordinates: lat=${latitude}, lon=${longitude}`);
    }

    // Validate radius
    if (radius < 0 || radius > 20) {
      throw new Error('Radius must be between 0 and 20 kilometers');
    }

    // Step 1: Calculate bounding box
    const bbox = getBoundingBox(latitude, longitude, radius);

    // Step 2: Build query conditions
    const whereConditions = {
      latitude: {
        [Op.between]: [bbox.south, bbox.north],
      },
    };

    // Handle longitude (may cross International Date Line)
    if (bbox.west <= bbox.east) {
      whereConditions.longitude = {
        [Op.between]: [bbox.west, bbox.east],
      };
    } else {
      // Crosses date line
      whereConditions.longitude = {
        [Op.or]: [{ [Op.gte]: bbox.west }, { [Op.lte]: bbox.east }],
      };
    }

    // Add category filter if provided
    if (categories && categories.length > 0) {
      whereConditions.category = {
        [Op.in]: categories,
      };
    }

    // Step 3: Query database
    const poisInBox = await PointOfInterest.findAll({
      where: whereConditions,
      order: [
        ['rank', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    // Step 4: Filter by actual Haversine distance
    const poisWithDistance = poisInBox
      .map(poi => {
        const distance = calculateDistance(
          latitude,
          longitude,
          parseFloat(poi.latitude),
          parseFloat(poi.longitude)
        );
        return {
          poi,
          distance,
        };
      })
      .filter(item => item.distance <= radius)
      .sort((a, b) => {
        // Sort by rank first, then by name
        if (a.poi.rank !== b.poi.rank) {
          return a.poi.rank - b.poi.rank;
        }
        return a.poi.name.localeCompare(b.poi.name);
      });

    // Step 5: Apply pagination
    const totalCount = poisWithDistance.length;
    const paginatedResults = poisWithDistance.slice(offset, offset + limit).map(item => item.poi);

    return {
      rows: paginatedResults,
      count: totalCount,
    };
  } catch (error) {
    console.error('Error in findByRadius:', error.message);
    throw error;
  }
}

/**
 * Find POIs within a rectangular bounding box
 * 
 * @param {number} north - North boundary latitude
 * @param {number} south - South boundary latitude
 * @param {number} east - East boundary longitude
 * @param {number} west - West boundary longitude
 * @param {Array<string>} categories - Optional array of category filters
 * @param {number} limit - Number of results per page (default: 10)
 * @param {number} offset - Number of results to skip (default: 0)
 * @returns {Promise<{rows: Array, count: number}>} POIs and total count
 */
async function findByBoundingBox(
  north,
  south,
  east,
  west,
  categories = null,
  limit = 10,
  offset = 0
) {
  try {
    // Validate coordinates
    if (
      !isValidCoordinate(north, 0) ||
      !isValidCoordinate(south, 0) ||
      !isValidCoordinate(0, east) ||
      !isValidCoordinate(0, west)
    ) {
      throw new Error('Invalid bounding box coordinates');
    }

    // Validate north > south
    if (north <= south) {
      throw new Error('North boundary must be greater than south boundary');
    }

    // Build query conditions
    const whereConditions = {
      latitude: {
        [Op.between]: [south, north],
      },
    };

    // Handle longitude (may cross International Date Line)
    if (west <= east) {
      whereConditions.longitude = {
        [Op.between]: [west, east],
      };
    } else {
      // Crosses date line
      whereConditions.longitude = {
        [Op.or]: [{ [Op.gte]: west }, { [Op.lte]: east }],
      };
    }

    // Add category filter if provided
    if (categories && categories.length > 0) {
      whereConditions.category = {
        [Op.in]: categories,
      };
    }

    // Query database with pagination
    const { rows, count } = await PointOfInterest.findAndCountAll({
      where: whereConditions,
      limit: limit,
      offset: offset,
      order: [
        ['rank', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    return {
      rows,
      count,
    };
  } catch (error) {
    console.error('Error in findByBoundingBox:', error.message);
    throw error;
  }
}

/**
 * Find a single POI by ID
 * 
 * @param {string} id - POI unique identifier
 * @returns {Promise<PointOfInterest|null>} POI instance or null if not found
 */
async function findById(id) {
  try {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('Invalid POI ID');
    }

    const poi = await PointOfInterest.findByPk(id);
    return poi;
  } catch (error) {
    console.error('Error in findById:', error.message);
    throw error;
  }
}

/**
 * Get total count of POIs matching given conditions
 * 
 * @param {object} whereConditions - Sequelize where conditions
 * @returns {Promise<number>} Total count
 */
async function getTotalCount(whereConditions = {}) {
  try {
    const count = await PointOfInterest.count({
      where: whereConditions,
    });
    return count;
  } catch (error) {
    console.error('Error in getTotalCount:', error.message);
    throw error;
  }
}

/**
 * Get all unique categories available in the database
 * 
 * @returns {Promise<Array<string>>} Array of category names
 */
async function getAvailableCategories() {
  try {
    const pois = await PointOfInterest.findAll({
      attributes: ['category'],
      group: ['category'],
    });
    return pois.map(poi => poi.category);
  } catch (error) {
    console.error('Error in getAvailableCategories:', error.message);
    throw error;
  }
}

/**
 * Find POIs by name (case-insensitive partial match)
 * 
 * @param {string} name - Search string for POI name
 * @param {Array<string>} categories - Optional array of category filters
 * @param {number} limit - Number of results per page (default: 10)
 * @param {number} offset - Number of results to skip (default: 0)
 * @returns {Promise<{rows: Array, count: number}>} POIs and total count
 */
async function findByName(
  name,
  categories = null,
  limit = 10,
  offset = 0
) {
  try {
    // Validate name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Name search string is required');
    }

    // Build query conditions
    const whereConditions = {
      name: {
        [Op.like]: `%${name.trim()}%`,
      },
    };

    // Add category filter if provided
    if (categories && categories.length > 0) {
      whereConditions.category = {
        [Op.in]: categories,
      };
    }

    // Query database with pagination
    const { rows, count } = await PointOfInterest.findAndCountAll({
      where: whereConditions,
      limit: limit,
      offset: offset,
      order: [
        ['rank', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    return {
      rows,
      count,
    };
  } catch (error) {
    console.error('Error in findByName:', error.message);
    throw error;
  }
}

/**
 * Get statistics about POIs in the database
 * 
 * @returns {Promise<object>} Statistics object
 */
async function getStatistics() {
  try {
    const total = await PointOfInterest.count();
    const categories = await getAvailableCategories();
    
    const categoryStats = {};
    for (const category of categories) {
      categoryStats[category] = await PointOfInterest.count({
        where: { category },
      });
    }

    return {
      total,
      categories: categoryStats,
    };
  } catch (error) {
    console.error('Error in getStatistics:', error.message);
    throw error;
  }
}

module.exports = {
  findByRadius,
  findByBoundingBox,
  findById,
  findByName,
  getTotalCount,
  getAvailableCategories,
  getStatistics,
};

