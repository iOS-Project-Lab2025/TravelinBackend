'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_favorites', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      poiId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'points_of_interest',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add unique constraint to prevent duplicate favorites
    await queryInterface.addIndex('user_favorites', ['userId', 'poiId'], {
      name: 'idx_user_favorites_unique',
      unique: true,
    });

    // Add indexes for faster queries
    await queryInterface.addIndex('user_favorites', ['userId'], {
      name: 'idx_user_favorites_user',
    });

    await queryInterface.addIndex('user_favorites', ['poiId'], {
      name: 'idx_user_favorites_poi',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_favorites');
  },
};
