'use strict';

/** @type {import('sequelize-cli').Migration} */

const userSeed = require('../../data/users.js');

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', userSeed);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {
      truncate: true,
      cascade: true,
      restartIdentity: true
    });
  }
};