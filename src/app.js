const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Custom middleware to set Amadeus content-type for API responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/vnd.amadeus+json');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TravelinAPI - Amadeus Points of Interest API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      documentation: '/api-docs',
      api: '/v1/reference-data/locations/pois',
    },
  });
});

// Mount API routes
const routes = require('./routes');
app.use('/', routes);

// 404 handler for undefined routes
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;

