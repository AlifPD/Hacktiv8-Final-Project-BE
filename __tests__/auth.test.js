const request = require("supertest");
const app = require("../app.js");
const { sequelize } = require("../db/models");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const users = require('../db/models/users');

const generateToken = (token) => {
    return jwt.sign(token, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    })
}

beforeAll(async () => {
    const userData = require("../data/users_test.json");

    userData.forEach((val) => {
        val.createdAt = new Date();
        val.updatedAt = new Date();
        val.password = bcrypt.hashSync(val.password, bcrypt.genSaltSync(10));
    });

    try {
        await sequelize.queryInterface.bulkInsert('users', userData);
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
    } catch (error) {
        console.log("Error bulkDelete: ", error);
    }
});

describe("Auth Controller Testing", () => {
    test("No Route", async () => {
        const res = await request(app).post("/api/auth/");

        expect(res.status).toBe(404);
    });

    describe("Sign Up Test", () => {
        describe("Success", () => {
            test("Success Sign Up", async () => {
                const body = {
                    "userName": "test",
                    "phoneNumber": "123456789",
                    "email": "test1@mail.com",
                    "password": "test1111",
                    "confirmPassword": "test1111"
                };

                const res = await request(app).post("/api/auth/signup").send(body);

                expect(res.status).toBe(201);
                expect(res.body).toBeInstanceOf(Object);
                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Successfully create new user");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toHaveProperty("id");
                expect(res.body.data).toHaveProperty("token");
                expect(res.body.data).toHaveProperty("userType");
                expect(res.body.data).toHaveProperty("userName");
                expect(res.body.data).toHaveProperty("phoneNumber");
                expect(res.body.data).toHaveProperty("email");
                expect(res.body.data).toHaveProperty("updatedAt");
                expect(res.body.data).toHaveProperty("createdAt");
            });
        });
        describe("Failed", () => {
            describe("Bad Request", () => {
                test("Password and Confirm Password Not the same", async () => {
                    const body = {
                        "userName": "test",
                        "phoneNumber": "123456789",
                        "email": "test1@mail.com",
                        "password": "test1111",
                        "confirmPassword": "test1112"
                    };

                    const res = await request(app).post("/api/auth/signup").send(body);

                    expect(res.status).toBe(400);
                });

                test("Password length less than 5", async () => {
                    const body = {
                        "userName": "test",
                        "phoneNumber": "123456789",
                        "email": "test1@mail.com",
                        "password": "test1",
                        "confirmPassword": "test1"
                    };

                    const res = await request(app).post("/api/auth/signup").send(body);

                    expect(res.status).toBe(400);
                });
            });
        });
    });

    describe("Login Test", () => {
        describe("Success", () => {
            test("Success Login Admin", async () => {
                const body = {
                    "email": "admintest1@mail.com",
                    "password": "admintest1111",
                };

                const res = await request(app).post("/api/auth/login").send(body);

                expect(res.status).toBe(200);
                expect(res.body).toBeInstanceOf(Object);
                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Login Success");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toHaveProperty("id");
                expect(res.body.data).toHaveProperty("token");
            });

            test("Success Login User", async () => {
                const body = {
                    "email": "usertest1@mail.com",
                    "password": "usertest1111",
                };

                const res = await request(app).post("/api/auth/login").send(body);

                expect(res.status).toBe(200);
                expect(res.body).toBeInstanceOf(Object);
                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Login Success");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toHaveProperty("id");
                expect(res.body.data).toHaveProperty("token");
            });
        });
        describe("Failed", () => {
            describe("Bad Request", () => {
                test("Empty Email", async () => {
                    const body = {
                        "email": "",
                        "password": "admintest1111",
                    };

                    const res = await request(app).post("/api/auth/login").send(body);

                    expect(res.status).toBe(400);
                });

                test("Empty Password", async () => {
                    const body = {
                        "email": "usertest1@mail.com",
                        "password": "",
                    };

                    const res = await request(app).post("/api/auth/login").send(body);

                    expect(res.status).toBe(400);
                });

                test("Empty Password", async () => {
                    const body = {
                        "email": "",
                        "password": "",
                    };

                    const res = await request(app).post("/api/auth/login").send(body);

                    expect(res.status).toBe(400);
                });
            });
            describe("Unauthorized", () => {
                test("Incorect Email", async () => {
                    const body = {
                        "email": "admintest2@mail.com",
                        "password": "admintest1111",
                    };

                    const resultDb = await users.findOne({
                        where: { email: body.email }
                    });

                    const res = await request(app).post("/api/auth/login").send(body);

                    expect(resultDb).toBe(null);

                    expect(res.status).toBe(401);
                });

                test("Incorect Password", async () => {
                    const body = {
                        "email": "admintest1@mail.com",
                        "password": "admintest1112",
                    };

                    const resultDb = await users.findOne({
                        where: { email: body.email }
                    });
                    const checkPassword = await bcrypt.compare(body.password, resultDb.password);

                    const res = await request(app).post("/api/auth/login").send(body);

                    expect(checkPassword).toBe(false);

                    expect(res.status).toBe(401);
                });
            });
        });
    });

    describe("Get Detail User Test", () => {
        describe("Success", () => {
            test("Success Get Detail User", async () => {
                const query = {
                    id: 1
                }
                const token = generateToken({ id: query.id })

                const res = await request(app).get("/api/auth/detail").query(query).set('Authorization', `Bearer ${token}`);

                expect(res.status).toBe(200);
                expect(res.body).toBeInstanceOf(Object);
                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Successfully get detail user data");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toHaveProperty("id");
                expect(res.body.data).toHaveProperty("userType");
                expect(res.body.data).toHaveProperty("userName");
                expect(res.body.data).toHaveProperty("phoneNumber");
                expect(res.body.data).toHaveProperty("email");
                expect(res.body.data).toHaveProperty("password");
                expect(res.body.data).toHaveProperty("updatedAt");
                expect(res.body.data).toHaveProperty("createdAt");
                expect(res.body.data).toHaveProperty("deletedAt");
            });
        });
        describe("Failed", () => {
            describe("Bad Request", () => {
                test("No Id Provided", async () => {
                    const query = {}
                    const token = generateToken({ id: 1 })

                    const res = await request(app).get("/api/auth/detail").query(query).set('Authorization', `Bearer ${token}`);

                    expect(res.status).toBe(400);
                });

                test("No Id Exist in DB", async () => {
                    const query = {
                        id: 99
                    }
                    const token = generateToken({ id: 1 })

                    const res = await request(app).get("/api/auth/detail").query(query).set('Authorization', `Bearer ${token}`);

                    expect(res.status).toBe(400);
                });

                test("Authorization bearer token come from user that don't exist", async () => {
                    const query = {
                        id: 1
                    }
                    const token = generateToken({ id: 99 })

                    const res = await request(app).get("/api/auth/detail").query(query).set('Authorization', `Bearer ${token}`);

                    expect(res.status).toBe(400);
                });
            });
            describe("Unauthorized", () => {
                test("No authorization bearer token", async () => {
                    const query = {
                        id: 1
                    }

                    const res = await request(app).get("/api/auth/detail").query(query);

                    expect(res.status).toBe(401);
                });
            });
        });
    });
});