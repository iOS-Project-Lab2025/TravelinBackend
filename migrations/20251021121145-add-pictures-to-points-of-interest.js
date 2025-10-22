'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('points_of_interest', 'pictures', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of picture URLs for the point of interest',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('points_of_interest', 'pictures');
  },
};
