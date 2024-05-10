'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const bcrypt = require('bcrypt');

const users = sequelize.define('users', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  userType: {
    type: DataTypes.ENUM('0', '1'),
    defaultValue: "1",
    allowNull: false,
    validate: {
      notNull: {
        msg: 'userType can\'t be null',
      },
      notEmpty: {
        msg: 'userType can\'t be empty',
      },
    },
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'userName can\'t be null',
      },
      notEmpty: {
        msg: 'userName can\'t be empty',
      },
    },
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'phoneNumber can\'t be null',
      },
      notEmpty: {
        msg: 'phoneNumber can\'t be empty',
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'email can\'t be null',
      },
      notEmpty: {
        msg: 'email can\'t be empty',
      },
      isEmail: {
        msg: 'Invalid email',
      }
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'password can\'t be null',
      },
      notEmpty: {
        msg: 'password can\'t be empty',
      },
    },
  }, confirmPassword: {
    type: DataTypes.VIRTUAL,
    set(value) {
      const hashPassword = bcrypt.hashSync(value, 10);
      this.setDataValue('password', hashPassword);
    }
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
  modelName: 'users',
  paranoid: true
});

module.exports = users;