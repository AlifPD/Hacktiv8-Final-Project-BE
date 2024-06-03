'use strict';

/** @type {import('sequelize-cli').Migration} */
const loansSeed = require('../../data/loans.js');

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('loans', loansSeed);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('loans', null, {
      truncate: true,
      cascade: true,
      restartIdentity: true
    });
  }
};
