'use strict';

/** @type {import('sequelize-cli').Migration} */

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', [{
      userType: '0',
      userName: 'Admin-1',
      phoneNumber: '123456789',
      email: process.env.ADMIN_EMAIL,
      password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userType: '1',
      userName: 'User-1',
      phoneNumber: '987654321',
      email: 'user1@mail.com',
      password: bcrypt.hashSync('user1111', 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users');
  }
};