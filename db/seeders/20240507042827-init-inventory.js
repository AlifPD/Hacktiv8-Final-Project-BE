'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('inventory', [
      {}, {}, {}, {}, {}
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('inventory');
  }
};
