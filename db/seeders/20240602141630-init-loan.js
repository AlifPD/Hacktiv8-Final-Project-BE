'use strict';

/** @type {import('sequelize-cli').Migration} */
const loansSeed = require('../../data/loans.js');

module.exports = {
  async up(queryInterface, Sequelize) {
    const today = new Date();
    loansSeed.forEach(value => {
      const dateReturn = new Date(value.dateReturn)
      if (dateReturn.getFullYear() < today.getFullYear() ||
        (dateReturn.getFullYear() === today.getFullYear() && dateReturn.getMonth() < today.getMonth()) ||
        (dateReturn.getFullYear() === today.getFullYear() && dateReturn.getMonth() === today.getMonth() && dateReturn.getDate() < today.getDate())) {
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
