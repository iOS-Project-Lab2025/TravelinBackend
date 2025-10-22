/**
 * Centralized Configuration Module
 * 
 * Loads and validates environment variables
 * Provides a single source of truth for application configuration
 */

require('dotenv').config();

// Environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';
const isProduction = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';

// Server Configuration
const PORT = parseInt(process.env.PORT || '3000', 10);
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Database Configuration
const DB_STORAGE = process.env.DB_STORAGE || './database.sqlite';
const DB_LOGGING = process.env.DB_LOGGING === 'true';

// Application Settings
const config = {
  // Environment
  env: NODE_ENV,
  isDevelopment,
  isProduction,
  isTest,

  // Server
  port: PORT,
  baseUrl: BASE_URL,

  // Database
  database: {
    storage: DB_STORAGE,
    logging: DB_LOGGING,
  },

  // API Settings
  api: {
    version: '1.0.0',
    prefix: '/v1',
    defaultLimit: 10,
    maxLimit: 100,
    maxRadius: 20,
  },

  // CORS Settings
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    format: isProduction ? 'combined' : 'dev',
  },
};

/**
 * Validate required configuration
 */
function validateConfig() {
  const required = ['port'];
  const missing = required.filter(key => !config[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }

  // Validate port range
  if (config.port < 1 || config.port > 65535) {
    throw new Error(`Invalid PORT: ${config.port}. Must be between 1 and 65535`);
  }

  return true;
}

// Validate on load
try {
  validateConfig();
  if (isDevelopment) {
    console.log('✅ Configuration loaded and validated');
  }
} catch (error) {
  console.error('❌ Configuration error:', error.message);
  process.exit(1);
}

module.exports = config;

