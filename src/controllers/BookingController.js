const BookingService = require('../services/BookingService');
const { buildPaginationMeta } = require('../utils/responseFormatter');
const config = require('../config');

/**
 * Booking Controller
 * Handles booking-related HTTP requests
 */
class BookingController {
  /**
   * Create a new booking
   * POST /v1/bookings
   */
  static async createBooking(req, res, next) {
    try {
      const userId = req.userId;
      const { poiId, startDate, endDate } = req.body;

      const booking = await BookingService.createBooking(userId, poiId, startDate, endDate);

      const baseUrl = config.baseUrl || `${req.protocol}://${req.get('host')}`;

      res.status(201).json({
        data: booking.toPublicJSON(baseUrl),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all user's bookings
   * GET /v1/bookings
   */
  static async getUserBookings(req, res, next) {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query['page[limit]'] || config.api.defaultLimit, 10);
      const offset = parseInt(req.query['page[offset]'] || 0, 10);

      const result = await BookingService.getUserBookings(userId, {
        limit,
        offset,
      });

      // Format bookings
      const baseUrl = config.baseUrl || `${req.protocol}://${req.get('host')}`;
      const formattedBookings = result.rows.map((booking) => booking.toPublicJSON(baseUrl));

      // Build pagination meta
      const meta = buildPaginationMeta(
        baseUrl,
        '/v1/bookings',
        req.query,
        result.count,
        limit,
        offset
      );

      res.status(200).json({
        data: formattedBookings,
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific booking by ID
   * GET /v1/bookings/:bookingId
   */
  static async getBooking(req, res, next) {
    try {
      const userId = req.userId;
      const { bookingId } = req.params;

      const booking = await BookingService.getBookingById(parseInt(bookingId, 10), userId);

      const baseUrl = config.baseUrl || `${req.protocol}://${req.get('host')}`;

      res.status(200).json({
        data: booking.toPublicJSON(baseUrl),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel a booking
   * DELETE /v1/bookings/:bookingId
   */
  static async cancelBooking(req, res, next) {
    try {
      const userId = req.userId;
      const { bookingId } = req.params;

      await BookingService.cancelBooking(parseInt(bookingId, 10), userId);

      res.status(200).json({
        data: {
          message: 'Booking cancelled successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check POI availability for given dates
   * GET /v1/bookings/availability
   */
  static async checkAvailability(req, res, next) {
    try {
      const { poiId, startDate, endDate } = req.query;

      const availability = await BookingService.checkAvailability(poiId, startDate, endDate);

      res.status(200).json({
        data: {
          poiId,
          startDate,
          endDate,
          available: availability.available,
          ...(availability.conflict && { conflict: availability.conflict }),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BookingController;

