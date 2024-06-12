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

describe("Loans Controller Testing", () => {
    test("No Route", async () => {
        const res = await request(app).post("/api/loans/");

        expect(res.status).toBe(404);
    });

    describe("Create New Loan Test", () => {
        describe("Success", () => {
            test("Success Create New Loan", async () => {
                const body = {
                    "idItem": 25,
                    "idUser": 1,
                    "dateLoan": new Date(), // Must be at least today
                    "dateReturn": new Date("2024-06-30T00:09:00.203Z"), // Must be at least today, Can't be before today
                    "quantity": 1
                }

                const token = generateToken({ id: 1 })

                const res = await request(app).post("/api/loans/create").set('Authorization', `Bearer ${token}`).send(body);

                expect(res.status).toBe(201);
                expect(res.body).toBeInstanceOf(Object);
                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Successfully create new Loan");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toHaveProperty("id");
                expect(res.body.data).toHaveProperty("idItem");
                expect(res.body.data).toHaveProperty("idUser");
                expect(res.body.data).toHaveProperty("dateLoan");
                expect(res.body.data).toHaveProperty("dateReturn");
                expect(res.body.data).toHaveProperty("status");
                expect(res.body.data).toHaveProperty("quantity");
                expect(res.body.data).toHaveProperty("updatedAt");
                expect(res.body.data).toHaveProperty("createdAt");
                expect(res.body.data).toHaveProperty("deletedAt");
            });
        });
        describe("Failed", () => { });
    });

    describe("Get Loan Test", () => {
        describe("Success", () => {
            test("Success Get All Loans", async () => {
                const token = generateToken({ id: 1 })

                const res = await request(app).get("/api/loans/history").set('Authorization', `Bearer ${token}`);

                expect(res.status).toBe(200);
                expect(res.body).toBeInstanceOf(Object);

                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Successfully get all loans");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toBeInstanceOf(Array);
                res.body.data.forEach((item) => {
                    expect(item).toHaveProperty("id");
                    expect(item).toHaveProperty("idItem");
                    expect(item).toHaveProperty("idUser");
                    expect(item).toHaveProperty("dateLoan");
                    expect(item).toHaveProperty("dateReturn");
                    expect(item).toHaveProperty("status");
                    expect(item).toHaveProperty("quantity");
                    expect(item).toHaveProperty("updatedAt");
                    expect(item).toHaveProperty("createdAt");
                    expect(item).toHaveProperty("deletedAt");

                    expect(item).toHaveProperty("user");
                    expect(item.user).toHaveProperty("id");
                    expect(item.user).toHaveProperty("userType");
                    expect(item.user).toHaveProperty("userName");
                    expect(item.user).toHaveProperty("phoneNumber");
                    expect(item.user).toHaveProperty("email");

                    expect(item).toHaveProperty("inventory");
                    expect(item.inventory).toHaveProperty("id");
                    expect(item.inventory).toHaveProperty("isAvailable");
                    expect(item.inventory).toHaveProperty("itemName");
                    expect(item.inventory).toHaveProperty("quantity");
                    expect(item.inventory).toHaveProperty("category");
                    expect(item.inventory).toHaveProperty("location");
                    expect(item.inventory).toHaveProperty("description");
                    expect(item.inventory).toHaveProperty("pictureUrl");
                });
            });
            test("Success Get All Loans with Pagination", async () => {
                const token = generateToken({ id: 1 })
                const query = {
                    limit: 5,
                    page: 1
                }

                const res = await request(app).get("/api/loans/history").query(query).set('Authorization', `Bearer ${token}`);

                expect(res.status).toBe(200);

                expect(res.body).toBeInstanceOf(Object);
                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", `Successfully get all loans, page ${query.page}`);
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toHaveProperty("total");
                expect(res.body.data).toHaveProperty("result");

                expect(res.body.data.result).toBeInstanceOf(Array);

                res.body.data.result.forEach((item) => {
                    expect(item).toHaveProperty("id");
                    expect(item).toHaveProperty("idItem");
                    expect(item).toHaveProperty("idUser");
                    expect(item).toHaveProperty("dateLoan");
                    expect(item).toHaveProperty("dateReturn");
                    expect(item).toHaveProperty("status");
                    expect(item).toHaveProperty("quantity");
                    expect(item).toHaveProperty("updatedAt");
                    expect(item).toHaveProperty("createdAt");
                    expect(item).toHaveProperty("deletedAt");

                    expect(item).toHaveProperty("user");
                    expect(item.user).toHaveProperty("id");
                    expect(item.user).toHaveProperty("userType");
                    expect(item.user).toHaveProperty("userName");
                    expect(item.user).toHaveProperty("phoneNumber");
                    expect(item.user).toHaveProperty("email");

                    expect(item).toHaveProperty("inventory");
                    expect(item.inventory).toHaveProperty("id");
                    expect(item.inventory).toHaveProperty("isAvailable");
                    expect(item.inventory).toHaveProperty("itemName");
                    expect(item.inventory).toHaveProperty("quantity");
                    expect(item.inventory).toHaveProperty("category");
                    expect(item.inventory).toHaveProperty("location");
                    expect(item.inventory).toHaveProperty("description");
                    expect(item.inventory).toHaveProperty("pictureUrl");
                });
            });
            test("Success Get All Loans with Search Filter", async () => {
                const token = generateToken({ id: 1 })
                const query = {
                    search: "alat"
                }
                const queryPagination = {
                    limit: 5,
                    page: 1,
                    search: "alat"
                }

                const res = await request(app).get("/api/loans/history").query(query).set('Authorization', `Bearer ${token}`);
                const resPagination = await request(app).get("/api/loans/history").query(queryPagination).set('Authorization', `Bearer ${token}`);

                expect(res.status).toBe(200);

                expect(res.body).toBeInstanceOf(Object);
                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Successfully get all loans");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toBeInstanceOf(Array);

                res.body.data.forEach((item) => {
                    expect(item).toHaveProperty("id");
                    expect(item).toHaveProperty("idItem");
                    expect(item).toHaveProperty("idUser");
                    expect(item).toHaveProperty("dateLoan");
                    expect(item).toHaveProperty("dateReturn");
                    expect(item).toHaveProperty("status");
                    expect(item).toHaveProperty("quantity");
                    expect(item).toHaveProperty("updatedAt");
                    expect(item).toHaveProperty("createdAt");
                    expect(item).toHaveProperty("deletedAt");

                    expect(item).toHaveProperty("user");
                    expect(item.user).toHaveProperty("id");
                    expect(item.user).toHaveProperty("userType");
                    expect(item.user).toHaveProperty("userName");
                    expect(item.user).toHaveProperty("phoneNumber");
                    expect(item.user).toHaveProperty("email");

                    expect(item).toHaveProperty("inventory");
                    expect(item.inventory).toHaveProperty("id");
                    expect(item.inventory).toHaveProperty("isAvailable");
                    expect(item.inventory).toHaveProperty("itemName");
                    expect(item.inventory).toHaveProperty("quantity");
                    expect(item.inventory).toHaveProperty("category");
                    expect(item.inventory).toHaveProperty("location");
                    expect(item.inventory).toHaveProperty("description");
                    expect(item.inventory).toHaveProperty("pictureUrl");
                });

                expect(resPagination.status).toBe(200);

                expect(resPagination.body).toBeInstanceOf(Object);
                expect(resPagination.body).toHaveProperty("status", "success");
                expect(resPagination.body).toHaveProperty("message", `Successfully get all loans, page ${queryPagination.page}`);
                expect(resPagination.body).toHaveProperty("data");

                expect(resPagination.body.data).toHaveProperty("total");
                expect(resPagination.body.data).toHaveProperty("result");

                expect(resPagination.body.data.result).toBeInstanceOf(Array);

                resPagination.body.data.result.forEach((item) => {
                    expect(item).toHaveProperty("id");
                    expect(item).toHaveProperty("idItem");
                    expect(item).toHaveProperty("idUser");
                    expect(item).toHaveProperty("dateLoan");
                    expect(item).toHaveProperty("dateReturn");
                    expect(item).toHaveProperty("status");
                    expect(item).toHaveProperty("quantity");
                    expect(item).toHaveProperty("updatedAt");
                    expect(item).toHaveProperty("createdAt");
                    expect(item).toHaveProperty("deletedAt");

                    expect(item).toHaveProperty("user");
                    expect(item.user).toHaveProperty("id");
                    expect(item.user).toHaveProperty("userType");
                    expect(item.user).toHaveProperty("userName");
                    expect(item.user).toHaveProperty("phoneNumber");
                    expect(item.user).toHaveProperty("email");

                    expect(item).toHaveProperty("inventory");
                    expect(item.inventory).toHaveProperty("id");
                    expect(item.inventory).toHaveProperty("isAvailable");
                    expect(item.inventory).toHaveProperty("itemName");
                    expect(item.inventory).toHaveProperty("quantity");
                    expect(item.inventory).toHaveProperty("category");
                    expect(item.inventory).toHaveProperty("location");
                    expect(item.inventory).toHaveProperty("description");
                    expect(item.inventory).toHaveProperty("pictureUrl");
                });
            });
        });
        describe("Failed", () => { });
    });

    describe("Get Loan Detail Test", () => {
        describe("Success", () => {
            test("Success Get Loan Detail", async () => {
                const token = generateToken({ id: 1 })
                const query = {id: 3}

                const res = await request(app).get("/api/loans/history/detail").query(query).set('Authorization', `Bearer ${token}`);

                expect(res.status).toBe(200);
                expect(res.body).toBeInstanceOf(Object);

                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Successfully get loan detail");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toBeInstanceOf(Array);
                res.body.data.forEach((item) => {
                    expect(item).toHaveProperty("id");
                    expect(item.id).toBe(query.id)
                    expect(item).toHaveProperty("idItem");
                    expect(item).toHaveProperty("idUser");
                    expect(item).toHaveProperty("dateLoan");
                    expect(item).toHaveProperty("dateReturn");
                    expect(item).toHaveProperty("status");
                    expect(item).toHaveProperty("quantity");
                    expect(item).toHaveProperty("updatedAt");
                    expect(item).toHaveProperty("createdAt");
                    expect(item).toHaveProperty("deletedAt");

                    expect(item).toHaveProperty("user");
                    expect(item.user).toHaveProperty("id");
                    expect(item.user).toHaveProperty("userType");
                    expect(item.user).toHaveProperty("userName");
                    expect(item.user).toHaveProperty("phoneNumber");
                    expect(item.user).toHaveProperty("email");

                    expect(item).toHaveProperty("inventory");
                    expect(item.inventory).toHaveProperty("id");
                    expect(item.inventory).toHaveProperty("isAvailable");
                    expect(item.inventory).toHaveProperty("itemName");
                    expect(item.inventory).toHaveProperty("quantity");
                    expect(item.inventory).toHaveProperty("category");
                    expect(item.inventory).toHaveProperty("location");
                    expect(item.inventory).toHaveProperty("description");
                    expect(item.inventory).toHaveProperty("pictureUrl");
                });
            });
        });
        describe("Failed", () => { });
    });

    describe("Delete Loan Test", () => {
        describe("Success", () => {
            test("Success Delete Loan", async () => {
                const token = generateToken({ id: 1 })
                const query = { id: 7 }

                const res = await request(app).delete("/api/loans/delete/").query(query).set('Authorization', `Bearer ${token}`);

                expect(res.status).toBe(200);
                expect(res.body).toBeInstanceOf(Object);

                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Successfully delete loan item");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toBeInstanceOf(Array);

                expect(res.body.data[0]).toHaveProperty("id");
                expect(res.body.data[0]).toHaveProperty("idItem");
                expect(res.body.data[0]).toHaveProperty("idUser");
                expect(res.body.data[0]).toHaveProperty("dateLoan");
                expect(res.body.data[0]).toHaveProperty("dateReturn");
                expect(res.body.data[0]).toHaveProperty("status");
                expect(res.body.data[0]).toHaveProperty("quantity");
                expect(res.body.data[0]).toHaveProperty("updatedAt");
                expect(res.body.data[0]).toHaveProperty("createdAt");
                expect(res.body.data[0]).toHaveProperty("deletedAt");

                const resValidateDelete = await request(app).get("/api/loans/history/").set('Authorization', `Bearer ${token}`);

                expect(resValidateDelete.status).toBe(200);

                const checkLoanDeleted = resValidateDelete.body.data.some(item => item.id == query.id);
                expect(checkLoanDeleted).toBe(false)
            });
        });
        describe("Failed", () => { });
    });

    describe("Edit Loan Test", () => {
        describe("Success", () => {
            test("Success Update Loan", async () => {
                const token = generateToken({ id: 1 })
                const query = { id: 1 }
                const body = {
                    "idItem": 1,
                    "status": "Sudah Dikembalikan"
                }

                const res = await request(app).put("/api/loans/update").query(query).set('Authorization', `Bearer ${token}`).send(body);

                expect(res.status).toBe(200);
                expect(res.body).toBeInstanceOf(Object);

                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Successfully update loan item");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toBeInstanceOf(Array);
                expect(res.body.data[0]).toBe(1);
                res.body.data[1].forEach((item) => {
                    expect(item).toHaveProperty("id");
                    expect(item).toHaveProperty("idItem");
                    expect(item).toHaveProperty("idUser");
                    expect(item).toHaveProperty("dateLoan");
                    expect(item).toHaveProperty("dateReturn");
                    expect(item).toHaveProperty("status");
                    expect(item).toHaveProperty("quantity");
                    expect(item).toHaveProperty("updatedAt");
                    expect(item).toHaveProperty("createdAt");
                    expect(item).toHaveProperty("deletedAt");
                });

                const resValidateUpdate = await request(app).get("/api/loans/history/detail").query(query).set('Authorization', `Bearer ${token}`);

                expect(resValidateUpdate.status).toBe(200);

                expect(resValidateUpdate.body).toBeInstanceOf(Object);
                expect(resValidateUpdate.body).toHaveProperty("status", "success");
                expect(resValidateUpdate.body).toHaveProperty("message", "Successfully get loan detail");
                expect(resValidateUpdate.body).toHaveProperty("data");


                expect(resValidateUpdate.body.data).toBeInstanceOf(Array);
                expect(resValidateUpdate.body.data[0].id).toBe(query.id);
                expect(resValidateUpdate.body.data[0].status).toBe(body.status);
            });
        });
        describe("Failed", () => { });
    });
});