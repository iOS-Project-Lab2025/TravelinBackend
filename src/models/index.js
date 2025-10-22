const { sequelize } = require('../config/sequelize');
const PointOfInterest = require('./PointOfInterest');

// Export all models and sequelize instance
module.exports = {
  sequelize,
  PointOfInterest,
};

