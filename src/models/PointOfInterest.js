const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

class PointOfInterest extends Model {
  /**
   * Format POI instance to public JSON response according to Swagger spec
   * @param {string} baseUrl - Base URL for generating links
   * @returns {object} Formatted location object
   */
  toPublicJSON(baseUrl) {
    return {
      id: this.id,
      self: this.getSelfLink(baseUrl),
      type: this.type,
      subType: this.subType,
      name: this.name,
      geoCode: this.getGeoCode(),
      category: this.category,
      rank: this.rank,
      tags: Array.isArray(this.tags) ? this.tags : [],
      pictures: Array.isArray(this.pictures) ? this.pictures : [],
    };
  }

  /**
   * Get geoCode object with latitude and longitude
   * @returns {object} GeoCode object
   */
  getGeoCode() {
    return {
      latitude: parseFloat(this.latitude),
      longitude: parseFloat(this.longitude),
    };
  }

  /**
   * Generate self link object for the location
   * @param {string} baseUrl - Base URL for generating links
   * @returns {object} Self link object
   */
  getSelfLink(baseUrl) {
    return {
      href: `${baseUrl}/v1/reference-data/locations/pois/${this.id}`,
      methods: ['GET'],
    };
  }

  /**
   * Static method to find POIs within a radius
   * This is a placeholder - actual implementation will be in the service layer
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {number} radius - Search radius in kilometers
   * @param {object} options - Additional query options
   * @returns {Promise<object>} Query results
   */
  static async findByRadius(lat, lon, radius, options = {}) {
    // This method serves as an interface
    // Actual implementation will be in PoiService.js
    throw new Error('Use PoiService.findByRadius() instead');
  }

  /**
   * Static method to find POIs within a bounding box
   * This is a placeholder - actual implementation will be in the service layer
   * @param {number} north - North boundary
   * @param {number} south - South boundary
   * @param {number} east - East boundary
   * @param {number} west - West boundary
   * @param {object} options - Additional query options
   * @returns {Promise<object>} Query results
   */
  static async findByBoundingBox(north, south, east, west, options = {}) {
    // This method serves as an interface
    // Actual implementation will be in PoiService.js
    throw new Error('Use PoiService.findByBoundingBox() instead');
  }
}

// Initialize the model
PointOfInterest.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      comment: 'Unique identifier for the POI',
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'location',
      validate: {
        notEmpty: {
          msg: 'Type cannot be empty',
        },
      },
      comment: 'Resource type',
    },
    subType: {
      type: DataTypes.ENUM('AIRPORT', 'CITY', 'POINT_OF_INTEREST', 'DISTRICT'),
      allowNull: false,
      defaultValue: 'POINT_OF_INTEREST',
      validate: {
        isIn: {
          args: [['AIRPORT', 'CITY', 'POINT_OF_INTEREST', 'DISTRICT']],
          msg: 'SubType must be one of: AIRPORT, CITY, POINT_OF_INTEREST, DISTRICT',
        },
      },
      comment: 'Location sub-type',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Name is required',
        },
        notEmpty: {
          msg: 'Name cannot be empty',
        },
        len: {
          args: [1, 255],
          msg: 'Name must be between 1 and 255 characters',
        },
      },
      comment: 'Name of the point of interest',
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Latitude is required',
        },
        isDecimal: {
          msg: 'Latitude must be a decimal number',
        },
        min: {
          args: [-90],
          msg: 'Latitude must be between -90 and 90',
        },
        max: {
          args: [90],
          msg: 'Latitude must be between -90 and 90',
        },
      },
      comment: 'Latitude in decimal coordinates',
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Longitude is required',
        },
        isDecimal: {
          msg: 'Longitude must be a decimal number',
        },
        min: {
          args: [-180],
          msg: 'Longitude must be between -180 and 180',
        },
        max: {
          args: [180],
          msg: 'Longitude must be between -180 and 180',
        },
      },
      comment: 'Longitude in decimal coordinates',
    },
    category: {
      type: DataTypes.ENUM('SIGHTS', 'BEACH_PARK', 'HISTORICAL', 'NIGHTLIFE', 'RESTAURANT', 'SHOPPING'),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Category is required',
        },
        isIn: {
          args: [['SIGHTS', 'BEACH_PARK', 'HISTORICAL', 'NIGHTLIFE', 'RESTAURANT', 'SHOPPING']],
          msg: 'Category must be one of: SIGHTS, BEACH_PARK, HISTORICAL, NIGHTLIFE, RESTAURANT, SHOPPING',
        },
      },
      comment: 'Category of the location',
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
      validate: {
        isInt: {
          msg: 'Rank must be an integer',
        },
        min: {
          args: [1],
          msg: 'Rank must be a positive integer',
        },
      },
      comment: 'Rank for sorting (lower number = higher priority)',
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isArrayOrNull(value) {
          if (value !== null && value !== undefined && !Array.isArray(value)) {
            throw new Error('Tags must be an array');
          }
        },
      },
      comment: 'Array of tags describing the location',
    },
    pictures: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isArrayOrNull(value) {
          if (value !== null && value !== undefined && !Array.isArray(value)) {
            throw new Error('Pictures must be an array');
          }
        },
      },
      comment: 'Array of picture URLs for the point of interest',
    },
  },
  {
    sequelize,
    modelName: 'PointOfInterest',
    tableName: 'points_of_interest',
    timestamps: true,
    indexes: [
      {
        name: 'idx_poi_coordinates',
        fields: ['latitude', 'longitude'],
      },
      {
        name: 'idx_poi_category',
        fields: ['category'],
      },
      {
        name: 'idx_poi_rank',
        fields: ['rank'],
      },
      {
        name: 'idx_poi_category_rank',
        fields: ['category', 'rank'],
      },
    ],
  }
);

module.exports = PointOfInterest;

