const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

class UserFavorite extends Model {}

// Initialize the model
UserFavorite.init(
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
  },
  {
    sequelize,
    modelName: 'UserFavorite',
    tableName: 'user_favorites',
    timestamps: true,
    indexes: [
      {
        name: 'idx_user_favorites_unique',
        fields: ['userId', 'poiId'],
        unique: true,
      },
      {
        name: 'idx_user_favorites_user',
        fields: ['userId'],
      },
      {
        name: 'idx_user_favorites_poi',
        fields: ['poiId'],
      },
    ],
  }
);

module.exports = UserFavorite;

