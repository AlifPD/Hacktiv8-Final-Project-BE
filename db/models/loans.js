'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const inventory = require('./inventory');
const users = require('./users');

const loans = sequelize.define('loans', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  idItem: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: inventory,
      key: 'id'
    },
  },
  idUser: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: users,
      key: 'id'
    },
  },
  dateLoan: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  dateReturn: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Sedang Dipinjam', 'Belum Dikembalikan', 'Sudah Dikembalikan'),
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  deletedAt: {
    type: DataTypes.DATE,
  }
}, {
  freezeTableName: true,
  modelName: 'loans',
  paranoid: true,
});

users.hasMany(loans, { foreignKey: 'idUser' });
loans.belongsTo(users, { foreignKey: 'idUser' });

inventory.hasMany(loans, { foreignKey: 'idItem' });
loans.belongsTo(inventory, { foreignKey: 'idItem' });

module.exports = loans;