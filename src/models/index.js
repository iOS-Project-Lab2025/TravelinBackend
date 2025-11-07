const { sequelize } = require('../config/sequelize');
const PointOfInterest = require('./PointOfInterest');
const User = require('./User');
const UserFavorite = require('./UserFavorite');

// Define relationships
User.belongsToMany(PointOfInterest, {
  through: UserFavorite,
  foreignKey: 'userId',
  otherKey: 'poiId',
  as: 'favorites',
});

PointOfInterest.belongsToMany(User, {
  through: UserFavorite,
  foreignKey: 'poiId',
  otherKey: 'userId',
  as: 'favoritedBy',
});

UserFavorite.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

UserFavorite.belongsTo(PointOfInterest, {
  foreignKey: 'poiId',
  as: 'poi',
});

// Export all models and sequelize instance
module.exports = {
  sequelize,
  PointOfInterest,
  User,
  UserFavorite,
};

