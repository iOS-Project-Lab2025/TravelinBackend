const { Booking, PointOfInterest, User } = require('../models');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { Op } = require('sequelize');

/**
 * Booking Service
 * Handles booking operations including creation, retrieval, cancellation, and availability checks
 */
class BookingService {
  /**
   * Create a new booking
   * @param {number} userId - User ID
   * @param {string} poiId - Point of Interest ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<object>} Created booking record with POI data
   */
  static async createBooking(userId, poiId, startDate, endDate) {
    // Verify POI exists
    const poi = await PointOfInterest.findByPk(poiId);
    if (!poi) {
      throw new NotFoundError('Point of Interest not found', {
        parameter: 'poiId',
      });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate date range
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError('Invalid date format. Use YYYY-MM-DD', {
        parameter: 'startDate, endDate',
      });
    }

    if (end <= start) {
      throw new ValidationError('End date must be after start date', {
        parameter: 'endDate',
      });
    }

    // Optional: Prevent booking in the past
    if (start < today) {
      throw new ValidationError('Start date cannot be in the past', {
        parameter: 'startDate',
      });
    }

    // Check for overlapping bookings
    const isAvailable = await this.checkAvailability(poiId, startDate, endDate);
    if (!isAvailable.available) {
      const conflictMessage = isAvailable.conflict
        ? `Conflicts with existing booking (${isAvailable.conflict.startDate} to ${isAvailable.conflict.endDate})`
        : 'Date range overlaps with existing booking';
      throw new ValidationError(`POI is not available for the selected dates. ${conflictMessage}`, {
        parameter: 'startDate, endDate',
      });
    }

    // Create booking
    const booking = await Booking.create({
      userId,
      poiId,
      startDate,
      endDate,
    });

    // Load POI data
    await booking.reload({
      include: [
        {
          model: PointOfInterest,
          as: 'poi',
          required: true,
        },
      ],
    });

    return booking;
  }

  /**
   * Get all bookings for a user
   * @param {number} userId - User ID
   * @param {object} options - Query options (limit, offset)
   * @returns {Promise<object>} Bookings with POI data
   */
  static async getUserBookings(userId, options = {}) {
    const { limit = 10, offset = 0 } = options;

    const { count, rows } = await Booking.findAndCountAll({
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
      order: [['startDate', 'ASC'], ['createdAt', 'DESC']],
    });

    return {
      count,
      rows,
    };
  }

  /**
   * Get a specific booking by ID
   * @param {number} bookingId - Booking ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<object>} Booking with POI data
   */
  static async getBookingById(bookingId, userId) {
    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: PointOfInterest,
          as: 'poi',
          required: true,
        },
      ],
    });

    if (!booking) {
      throw new NotFoundError('Booking not found', {
        parameter: 'bookingId',
      });
    }

    // Verify user owns the booking
    if (booking.userId !== userId) {
      throw new NotFoundError('Booking not found', {
        parameter: 'bookingId',
      });
    }

    return booking;
  }

  /**
   * Cancel a booking
   * @param {number} bookingId - Booking ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<boolean>} True if cancelled
   */
  static async cancelBooking(bookingId, userId) {
    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found', {
        parameter: 'bookingId',
      });
    }

    // Verify user owns the booking
    if (booking.userId !== userId) {
      throw new NotFoundError('Booking not found', {
        parameter: 'bookingId',
      });
    }

    await booking.destroy();
    return true;
  }

  /**
   * Check if a POI is available for given dates
   * @param {string} poiId - Point of Interest ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @param {number} excludeBookingId - Optional booking ID to exclude from check (for updates)
   * @returns {Promise<object>} Availability status with conflict details if any
   */
  static async checkAvailability(poiId, startDate, endDate, excludeBookingId = null) {
    // Verify POI exists
    const poi = await PointOfInterest.findByPk(poiId);
    if (!poi) {
      throw new NotFoundError('Point of Interest not found', {
        parameter: 'poiId',
      });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError('Invalid date format. Use YYYY-MM-DD', {
        parameter: 'startDate, endDate',
      });
    }

    if (end <= start) {
      throw new ValidationError('End date must be after start date', {
        parameter: 'endDate',
      });
    }

    // Build where condition to find overlapping bookings
    // Overlap occurs when: (startDate <= newEndDate AND endDate >= newStartDate)
    const whereCondition = {
      poiId,
      [Op.and]: [
        { startDate: { [Op.lte]: endDate } },
        { endDate: { [Op.gte]: startDate } },
      ],
    };

    // Exclude specific booking if provided (for update scenarios)
    if (excludeBookingId) {
      whereCondition.id = { [Op.ne]: excludeBookingId };
    }

    // Find overlapping bookings
    const overlappingBookings = await Booking.findAll({
      where: whereCondition,
      limit: 1, // We only need to know if any exist
    });

    if (overlappingBookings.length > 0) {
      return {
        available: false,
        conflict: {
          id: overlappingBookings[0].id,
          startDate: overlappingBookings[0].startDate,
          endDate: overlappingBookings[0].endDate,
        },
      };
    }

    return {
      available: true,
    };
  }

  /**
   * Get all bookings for a POI
   * @param {string} poiId - Point of Interest ID
   * @param {object} options - Query options (limit, offset)
   * @returns {Promise<object>} Bookings with user data
   */
  static async getPoiBookings(poiId, options = {}) {
    // Verify POI exists
    const poi = await PointOfInterest.findByPk(poiId);
    if (!poi) {
      throw new NotFoundError('Point of Interest not found', {
        parameter: 'poiId',
      });
    }

    const { limit = 10, offset = 0 } = options;

    const { count, rows } = await Booking.findAndCountAll({
      where: { poiId },
      include: [
        {
          model: User,
          as: 'user',
          required: true,
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
      ],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['startDate', 'ASC']],
    });

    return {
      count,
      rows,
    };
  }
}

module.exports = BookingService;

