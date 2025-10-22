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
 * API infßormation endpoint
 */
router.get('/v1', (req, res) => {
  res.end({
    name: 'TravelinAPI - Amadeus Points of Interest',
    version: '1.0.0',
    specification: 'Swagger 2.0',
    endpoints: {
      pois: '/v1/reference-data/locations/pois',
      poisBySquare: '/v1/reference-data/locations/pois/by-square',
      poisById: '/v1/reference-data/locations/pois/:poisId',
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

