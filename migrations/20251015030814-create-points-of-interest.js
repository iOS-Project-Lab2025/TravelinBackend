'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('points_of_interest', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
        comment: 'Unique identifier for the POI (e.g., 9CB40CB5D0)',
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'location',
        comment: 'Resource type',
      },
      subType: {
        type: Sequelize.ENUM('AIRPORT', 'CITY', 'POINT_OF_INTEREST', 'DISTRICT'),
        allowNull: false,
        defaultValue: 'POINT_OF_INTEREST',
        comment: 'Location sub-type',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Name of the point of interest',
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
        comment: 'Latitude in decimal coordinates (-90 to 90)',
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
        comment: 'Longitude in decimal coordinates (-180 to 180)',
      },
      category: {
        type: Sequelize.ENUM(
          'SIGHTS',
          'BEACH_PARK',
          'HISTORICAL',
          'NIGHTLIFE',
          'RESTAURANT',
          'SHOPPING'
        ),
        allowNull: false,
        comment: 'Category of the location',
      },
      rank: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100,
        comment: 'Rank for sorting (lower number = higher priority)',
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of tags describing the location',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add composite index for geospatial queries
    await queryInterface.addIndex('points_of_interest', ['latitude', 'longitude'], {
      name: 'idx_poi_coordinates',
      comment: 'Index for geospatial queries',
    });

    // Add index on category for filtering
    await queryInterface.addIndex('points_of_interest', ['category'], {
      name: 'idx_poi_category',
      comment: 'Index for category filtering',
    });

    // Add index on rank for sorting
    await queryInterface.addIndex('points_of_interest', ['rank'], {
      name: 'idx_poi_rank',
      comment: 'Index for rank-based sorting',
    });

    // Add composite index for common query pattern (category + rank)
    await queryInterface.addIndex('points_of_interest', ['category', 'rank'], {
      name: 'idx_poi_category_rank',
      comment: 'Index for category filtering with rank sorting',
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop indexes first
    await queryInterface.removeIndex('points_of_interest', 'idx_poi_category_rank');
    await queryInterface.removeIndex('points_of_interest', 'idx_poi_rank');
    await queryInterface.removeIndex('points_of_interest', 'idx_poi_category');
    await queryInterface.removeIndex('points_of_interest', 'idx_poi_coordinates');

    // Drop table
    await queryInterface.dropTable('points_of_interest');
  },
};
