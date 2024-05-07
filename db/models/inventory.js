'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const inventory = sequelize.define('inventory', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  itemName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'name can\'t be null',
      },
      notEmpty: {
        msg: 'name can\'t be empty',
      },
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'quantity can\'t be null',
      },
      notEmpty: {
        msg: 'quantity can\'t be empty',
      },
      isNumeric: {
        msg: 'quantity must be a number'
      },
      isInt: {
        msg: 'quantity must be a valid integer'
      },
      min: {
        args: [0],
        msg: 'quantity can\'t be negative value',
      },
    },
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'category can\'t be null',
      },
    },
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'location can\'t be null',
      },
    },
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'isAvailable can\'t be null',
      },
      notEmpty: {
        msg: 'isAvailable can\'t be empty',
      },
      isIn: {
        args: [[true, false]],
        msg: 'availability must be boolean value',
      },
    },
  },
  pictureUrl: {
    type: DataTypes.STRING,
    defaultValue: "",
    allowNull: false,
    validate: {
      notNull: {
        msg: 'picture url can\'t be null',
      },
    },
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  deletedAt: {
    type: DataTypes.DATE,
  }
}, {
  freezeTableName: true,
  modelName: 'inventory',
  paranoid: true,
});

module.exports = inventory;