const request = require("supertest");
const app = require("../app.js");
const { sequelize } = require("../db/models");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const users = require('../db/models/users');
const inventory = require('../db/models/inventory');
const loans = require('../db/models/loans.js');

const generateToken = (token) => {
    return jwt.sign(token, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    })
}

// beforeAll(async () => {
//     const inventoryData = require("../data/inventory.json");

//     inventoryData.forEach((val) => {
//         val.createdAt = new Date();
//         val.updatedAt = new Date();
//     });

//     try {
//         await sequelize.queryInterface.bulkInsert('inventory', inventoryData);
//     } catch (error) {
//         console.log("Error bulkInsert: ", error);
//     }
// });

// afterAll(async () => {
//     try {
//         await sequelize.queryInterface.bulkDelete('inventory', null, {
//             truncate: true,
//             cascade: true,
//             restartIdentity: true
//         });
//     } catch (error) {
//         console.log("Error bulkDelete: ", error);
//     }
// });

describe("Loans Controller Testing", () => {
    test("", () => {});
});