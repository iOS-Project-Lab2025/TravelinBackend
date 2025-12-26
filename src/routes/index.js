/**
 * Main Router
 * 
 * Mounts all route modules and provides base routing structure
 */

const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const path = require('path');

// Load Swagger specification
const swaggerDocument = require('../../spec/PointOfInterest.json');

// Import route modules
const poiRoutes = require('./poi.routes');
const authRoutes = require('./auth.routes');
const favoritesRoutes = require('./favorites.routes');
const bookingRoutes = require('./booking.routes');

/**
 * Mount POI routes at /v1/reference-data/locations/pois
 * 
 * This matches the Amadeus API specification:
 * - GET /v1/reference-data/locations/pois
 * - GET /v1/reference-data/locations/pois/by-square
 * - GET /v1/reference-data/locations/pois/:poisId
 */
router.use('/v1/reference-data/locations/pois', poiRoutes);

/**
 * Mount authentication routes at /v1/auth
 * 
 * - POST /v1/auth/register
 * - POST /v1/auth/login
 * - GET /v1/auth/me
 * - DELETE /v1/auth/me
 */
router.use('/v1/auth', authRoutes);

/**
 * Mount favorites routes at /v1/favorites
 * 
 * - GET /v1/favorites
 * - POST /v1/favorites
 * - GET /v1/favorites/:poiId/check
 * - DELETE /v1/favorites/:poiId
 */
router.use('/v1/favorites', favoritesRoutes);

/**
 * Mount booking routes at /v1/bookings
 * 
 * - POST /v1/bookings
 * - GET /v1/bookings
 * - GET /v1/bookings/:bookingId
 * - DELETE /v1/bookings/:bookingId
 * - GET /v1/bookings/availability
 */
router.use('/v1/bookings', bookingRoutes);

/**
 * API information endpoint
 */
router.get('/v1', (req, res) => {
  res.json({
    name: 'TravelinAPI - Amadeus Points of Interest',
    version: '1.0.0',
    specification: 'Swagger 2.0',
    endpoints: {
      pois: '/v1/reference-data/locations/pois',
      poisBySquare: '/v1/reference-data/locations/pois/by-square',
      poisByName: '/v1/reference-data/locations/pois/by-name',
      poisById: '/v1/reference-data/locations/pois/:poisId',
      auth: {
        register: '/v1/auth/register',
        login: '/v1/auth/login',
        me: '/v1/auth/me',
        deleteAccount: '/v1/auth/me',
      },
      favorites: {
        list: '/v1/favorites',
        add: '/v1/favorites',
        check: '/v1/favorites/:poiId/check',
        remove: '/v1/favorites/:poiId',
      },
      bookings: {
        create: '/v1/bookings',
        list: '/v1/bookings',
        get: '/v1/bookings/:bookingId',
        cancel: '/v1/bookings/:bookingId',
        availability: '/v1/bookings/availability',
      },
      health: '/health',
      documentation: '/api-docs',
    },
    documentation: 'https://developers.amadeus.com',
  });
});

/**
 * Swagger UI Documentation
 * Available at /api-docs
 */
const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TravelinAPI - Points of Interest Documentation',
  swaggerOptions: {
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
};

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument, swaggerOptions));

module.exports = router;

