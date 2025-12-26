/**
 * Booking Routes
 * 
 * Defines all booking-related routes
 */

const express = require('express');
const router = express.Router();

// Import controllers
const BookingController = require('../controllers/BookingController');

// Import validation middleware
const {
  validateCreateBooking,
  validateGetBookings,
  validateCheckAvailability,
  validateGetBookingById,
} = require('../middleware/validation');

// Import authentication middleware
const { authenticate, optionalAuthenticate } = require('../middleware/auth');

/**
 * GET /bookings/availability
 * Check POI availability for given dates (optional authentication)
 * IMPORTANT: This route must come BEFORE /bookings/:bookingId
 */
router.get(
  '/availability',
  optionalAuthenticate,
  validateCheckAvailability,
  BookingController.checkAvailability
);

/**
 * GET /bookings
 * Get all user's bookings (requires authentication)
 */
router.get('/', authenticate, validateGetBookings, BookingController.getUserBookings);

/**
 * POST /bookings
 * Create a new booking (requires authentication)
 */
router.post('/', authenticate, validateCreateBooking, BookingController.createBooking);

/**
 * GET /bookings/:bookingId
 * Get a specific booking by ID (requires authentication)
 */
router.get(
  '/:bookingId',
  authenticate,
  validateGetBookingById,
  BookingController.getBooking
);

/**
 * DELETE /bookings/:bookingId
 * Cancel a booking (requires authentication)
 */
router.delete(
  '/:bookingId',
  authenticate,
  validateGetBookingById,
  BookingController.cancelBooking
);

module.exports = router;

