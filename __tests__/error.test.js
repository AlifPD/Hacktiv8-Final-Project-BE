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

beforeAll(async () => {
    const userData = require("../data/users_test.json");
    const inventoryData = require("../data/inventory_test.json");
    const loanData = require("../data/loans_test.json");

    userData.forEach((val) => {
        val.createdAt = new Date();
        val.updatedAt = new Date();
        val.password = bcrypt.hashSync(val.password, bcrypt.genSaltSync(10));
    });

    inventoryData.forEach((val) => {
        val.createdAt = new Date();
        val.updatedAt = new Date();
    });

    loanData.forEach((val) => {
        val.createdAt = new Date()
        val.updatedAt = new Date()
        val.deletedAt = null
    });

    try {
        await sequelize.queryInterface.bulkInsert('users', userData);
        await sequelize.queryInterface.bulkInsert('inventory', inventoryData);
        await sequelize.queryInterface.bulkInsert('loans', loanData);
    } catch (error) {
        console.log("Error bulkInsert: ", error);
    }
});

afterAll(async () => {
    try {
        await sequelize.queryInterface.bulkDelete('users', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true
        });
        await sequelize.queryInterface.bulkDelete('inventory', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true
        });
        await sequelize.queryInterface.bulkDelete('loans', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true
        });
    } catch (error) {
        console.log("Error bulkDelete: ", error);
    }
});

describe("Error Controller Test", () => {
    describe("Return error dev test", () => {
        test("No User Id Exist in DB", async () => {
            const token = generateToken({ id: 99 })

            const res = await request(app).get("/api/inventory/detail/all").set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(400);
        });
        // test("Phone number is null", async () => {
        //     const body = {
        //         "userName": "test",
        //         // "phoneNumber": "123456789",
        //         "email": "test1@mail.com",
        //         "password": "test1111",
        //         "confirmPassword": "test1111"
        //     };

        //     const res = await request(app).post("/api/auth/signup").send(body);

        //     expect(res.status).toBe(400);
        // });
    });
});