const request = require("supertest");
const app = require("../app.js");
const { sequelize } = require("../db/models");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const users = require('../db/models/users');
const inventory = require('../db/models/inventory');

const generateToken = (token) => {
    return jwt.sign(token, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    })
}

beforeAll(async () => {
    const userData = require("../data/users.json");
    const inventoryData = require("../data/inventory.json");
    
    userData.forEach((val) => {
        val.createdAt = new Date();
        val.updatedAt = new Date();
        val.password = bcrypt.hashSync(val.password, bcrypt.genSaltSync(10));
    });

    inventoryData.forEach((val) => {
        val.createdAt = new Date();
        val.updatedAt = new Date();
    });

    try {
        await sequelize.queryInterface.bulkInsert('users', userData);
        await sequelize.queryInterface.bulkInsert('inventory', inventoryData);
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
    } catch (error) {
        console.log("Error bulkDelete: ", error);
    }
});

describe("Inventory Controller Testing", () => {
    test("No Route", async () => {
        const res = await request(app).post("/api/inventory/");

        expect(res.status).toBe(404);
    });

    describe("Create Inventory Item Test", () => {
        describe("Success", () => {
            test("Success Create New Inventory Item", async() => {
                const body = {
                    "itemName": "Jarum Suntik",
                    "quantity": 50,
                    "category": "alat kesehatan",
                    "location": "gedung 5",
                    "isAvailable": true,
                    "description": "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sapiente laborum voluptates iure modi esse eaque natus, commodi, eos velit quod eum ratione nesciunt! Debitis velit porro, voluptas nesciunt dolorem eveniet. Ipsa ex libero dignissimos similique perferendis illo nam omnis accusamus sed neque aut quasi maxime vel, ad, esse eos itaque.",
                    "pictureUrl": "https://picsum.photos/seed/picsum/200/300"
                }

                const token = generateToken({ id: 1 })
    
                const res = await request(app).post("/api/inventory/create").set('Authorization', `Bearer ${token}`).send(body);

                expect(res.status).toBe(201);
                expect(res.body).toBeInstanceOf(Object);
                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Successfully create new item in inventory");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toHaveProperty("id");
                expect(res.body.data).toHaveProperty("isAvailable");
                expect(res.body.data).toHaveProperty("itemName");
                expect(res.body.data).toHaveProperty("quantity");
                expect(res.body.data).toHaveProperty("category");
                expect(res.body.data).toHaveProperty("location");
                expect(res.body.data).toHaveProperty("description");
                expect(res.body.data).toHaveProperty("pictureUrl");
                expect(res.body.data).toHaveProperty("updatedAt");
                expect(res.body.data).toHaveProperty("createdAt");
            });
        });
        describe("Failed", () => {
            describe("Bad Request", () => {
            });
            describe("Unauthorized", () => {});
            describe("Forbidden", () => {});
        });
    });

    describe("Get All Inventory Test", () => {
        describe("Success", () => {});
        describe("Failed", () => {});
    });

    describe("Get Detail Inventory Test", () => {
        describe("Success", () => {});
        describe("Failed", () => {});
    });

    describe("Delete Inventory Test", () => {
        describe("Success", () => {});
        describe("Failed", () => {});
    });

    describe("Edit Inventory Test", () => {
        describe("Success", () => {});
        describe("Failed", () => {});
    });
});