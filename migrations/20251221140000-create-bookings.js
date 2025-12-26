'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bookings', {
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
        comment: 'Reference to user',
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
        comment: 'Reference to point of interest',
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Booking start date',
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Booking end date',
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

    // Add indexes for faster queries
    await queryInterface.addIndex('bookings', ['userId'], {
      name: 'idx_bookings_user',
    });

    await queryInterface.addIndex('bookings', ['poiId'], {
      name: 'idx_bookings_poi',
    });

    await queryInterface.addIndex('bookings', ['startDate', 'endDate'], {
      name: 'idx_bookings_dates',
    });

    // Composite index for overlap checking
    await queryInterface.addIndex('bookings', ['poiId', 'startDate', 'endDate'], {
      name: 'idx_bookings_poi_dates',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bookings');
  },
};

