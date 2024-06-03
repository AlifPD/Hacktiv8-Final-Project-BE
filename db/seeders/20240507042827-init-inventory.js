'use strict';

/** @type {import('sequelize-cli').Migration} */

const inventorySeed = require('../../data/inventory.js');

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('inventory', inventorySeed);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('inventory', null, {
      truncate: true,
      cascade: true,
      restartIdentity: true
    });
  }
};
