'use strict';

/** @type {import('sequelize-cli').Migration} */
const loansSeed = require('../../data/loans.js');

module.exports = {
  async up(queryInterface, Sequelize) {
    const today = new Date();
    loansSeed.forEach(value => {
      if (value.dateReturn.getFullYear() < today.getFullYear() ||
        (value.dateReturn.getFullYear() === today.getFullYear() && value.dateReturn.getMonth() < today.getMonth()) ||
        (value.dateReturn.getFullYear() === today.getFullYear() && value.dateReturn.getMonth() === today.getMonth() && value.dateReturn.getDate() < today.getDate())) {
          if(value.status == 'Sedang Dipinjam'){
            value.status = 'Belum Dikembalikan'
          }
      }
    });
    return queryInterface.bulkInsert('loans', loansSeed);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('loans', null, {
      truncate: true,
      cascade: true,
      restartIdentity: true
    });
  }
};
