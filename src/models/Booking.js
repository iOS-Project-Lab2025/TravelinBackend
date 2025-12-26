const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

class Booking extends Model {
  /**
   * Format Booking instance to public JSON response
   * @param {string} baseUrl - Base URL for generating links
   * @returns {object} Formatted booking object
   */
  toPublicJSON(baseUrl) {
    const result = {
      id: this.id,
      self: this.getSelfLink(baseUrl),
      userId: this.userId,
      poiId: this.poiId,
      startDate: this.startDate,
      endDate: this.endDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    // Include POI data if loaded
    if (this.poi) {
      result.poi = this.poi.toPublicJSON(baseUrl);
    }

    // Include user data if loaded (optional, usually not needed)
    if (this.user) {
      result.user = this.user.toPublicJSON();
    }

    return result;
  }

  /**
   * Generate self link object for the booking
   * @param {string} baseUrl - Base URL for generating links
   * @returns {object} Self link object
   */
  getSelfLink(baseUrl) {
    return {
      href: `${baseUrl}/v1/bookings/${this.id}`,
      methods: ['GET', 'DELETE'],
    };
  }
}

// Initialize the model
Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Reference to user',
    },
    poiId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'points_of_interest',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Reference to point of interest',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Start date is required',
        },
        isDate: {
          msg: 'Start date must be a valid date',
        },
      },
      comment: 'Booking start date',
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'End date is required',
        },
        isDate: {
          msg: 'End date must be a valid date',
        },
      },
      comment: 'Booking end date',
    },
  },
  {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    timestamps: true,
    indexes: [
      {
        name: 'idx_bookings_user',
        fields: ['userId'],
      },
      {
        name: 'idx_bookings_poi',
        fields: ['poiId'],
      },
      {
        name: 'idx_bookings_dates',
        fields: ['startDate', 'endDate'],
      },
      {
        name: 'idx_bookings_poi_dates',
        fields: ['poiId', 'startDate', 'endDate'],
      },
    ],
    validate: {
      endDateAfterStartDate() {
        if (this.startDate && this.endDate) {
          const start = new Date(this.startDate);
          const end = new Date(this.endDate);
          if (end <= start) {
            throw new Error('End date must be after start date');
          }
        }
      },
    },
  }
);

module.exports = Booking;

