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

const isSorted = (array, key, order = "ASC") => {
    for (let i = 1; i < array.length; i++) {
        let a = array[i - 1][key];
        let b = array[i][key];

        if (typeof a === "string") a = a.toLowerCase();
        if (typeof b === "string") b = b.toLowerCase();

        if (order === "ASC" && a > b) {
            return false;
        }
        if (order === "DESC" && a < b) {
            return false;
        }
    }
    return true;
};


beforeAll(async () => {
    const userData = require("../data/users_test.json");
    const inventoryData = require("../data/inventory_test.json");

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
            test("Success Create New Inventory Item", async () => {
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
                test("No User Id Exist in DB", async () => {
                    const body = {
                        "itemName": "Selang Infus",
                        "quantity": 99,
                        "category": "alat kesehatan",
                        "location": "gedung 2",
                        "isAvailable": true,
                        "description": "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sapiente laborum voluptates iure modi esse eaque natus, commodi, eos velit quod eum ratione nesciunt! Debitis velit porro, voluptas nesciunt dolorem eveniet. Ipsa ex libero dignissimos similique perferendis illo nam omnis accusamus sed neque aut quasi maxime vel, ad, esse eos itaque.",
                        "pictureUrl": "https://picsum.photos/seed/picsum/200/300"
                    }
                    const token = generateToken({ id: 99 })

                    const res = await request(app).post("/api/inventory/create").set('Authorization', `Bearer ${token}`).send(body);

                    expect(res.status).toBe(400);
                });
            });
            describe("Unauthorized", () => {
                test("No authorization bearer token", async () => {
                    const body = {
                        "itemName": "Pipet",
                        "quantity": 99,
                        "category": "alat kesehatan",
                        "location": "gedung 10",
                        "isAvailable": true,
                        "description": "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sapiente laborum voluptates iure modi esse eaque natus, commodi, eos velit quod eum ratione nesciunt! Debitis velit porro, voluptas nesciunt dolorem eveniet. Ipsa ex libero dignissimos similique perferendis illo nam omnis accusamus sed neque aut quasi maxime vel, ad, esse eos itaque.",
                        "pictureUrl": "https://picsum.photos/seed/picsum/200/300"
                    }

                    const res = await request(app).post("/api/inventory/create").send(body);

                    expect(res.status).toBe(401);
                });
            });
            describe("Forbidden", () => {
                test("Authorization bearer token come from non-admin user", async () => {
                    const body = {
                        "itemName": "Sarung Tangan",
                        "quantity": 99,
                        "category": "alat kesehatan",
                        "location": "gedung 19",
                        "isAvailable": true,
                        "description": "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sapiente laborum voluptates iure modi esse eaque natus, commodi, eos velit quod eum ratione nesciunt! Debitis velit porro, voluptas nesciunt dolorem eveniet. Ipsa ex libero dignissimos similique perferendis illo nam omnis accusamus sed neque aut quasi maxime vel, ad, esse eos itaque.",
                        "pictureUrl": "https://picsum.photos/seed/picsum/200/300"
                    }
                    const token = generateToken({ id: 2 })

                    const res = await request(app).post("/api/inventory/create").set('Authorization', `Bearer ${token}`).send(body);

                    expect(res.status).toBe(403);
                });
            });
        });
    });

    describe("Get All Inventory Test", () => {
        describe("Success", () => {
            test("Success Get All Inventory Items", async () => {
                const token = generateToken({ id: 1 })

                const res = await request(app).get("/api/inventory/detail/all").set('Authorization', `Bearer ${token}`);

                expect(res.status).toBe(200);
                expect(res.body).toBeInstanceOf(Object);

                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Successfully get all inventory data");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toBeInstanceOf(Array);
                res.body.data.forEach((item) => {
                    expect(item).toHaveProperty("id");
                    expect(item).toHaveProperty("isAvailable");
                    expect(item).toHaveProperty("itemName");
                    expect(item).toHaveProperty("quantity");
                    expect(item).toHaveProperty("category");
                    expect(item).toHaveProperty("location");
                    expect(item).toHaveProperty("description");
                    expect(item).toHaveProperty("pictureUrl");
                    expect(item).toHaveProperty("updatedAt");
                    expect(item).toHaveProperty("createdAt");
                });
            });
            test("Success Get All Inventory Items with Pagination", async () => {
                const token = generateToken({ id: 1 })
                const query = {
                    limit: 5,
                    page: 1
                }

                const res = await request(app).get("/api/inventory/detail/all").query(query).set('Authorization', `Bearer ${token}`);

                expect(res.status).toBe(200);

                expect(res.body).toBeInstanceOf(Object);
                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", `Successfully get all inventory data, page: ${query.page}`);
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toHaveProperty("total");
                expect(res.body.data).toHaveProperty("result");

                expect(res.body.data.result).toBeInstanceOf(Array);
                expect(res.body.data.result.length).toBe(query.limit);

                res.body.data.result.forEach((item) => {
                    expect(item).toHaveProperty("id");
                    expect(item).toHaveProperty("isAvailable");
                    expect(item).toHaveProperty("itemName");
                    expect(item).toHaveProperty("quantity");
                    expect(item).toHaveProperty("category");
                    expect(item).toHaveProperty("location");
                    expect(item).toHaveProperty("description");
                    expect(item).toHaveProperty("pictureUrl");
                    expect(item).toHaveProperty("updatedAt");
                    expect(item).toHaveProperty("createdAt");
                });
            });
            test("Success Get All Inventory Items with Search Filter", async () => {
                const token = generateToken({ id: 1 })
                const query = {
                    search: "alat"
                }
                const queryPagination = {
                    limit: 5,
                    page: 1,
                    search: "alat"
                }

                const res = await request(app).get("/api/inventory/detail/all").query(query).set('Authorization', `Bearer ${token}`);
                const resPagination = await request(app).get("/api/inventory/detail/all").query(queryPagination).set('Authorization', `Bearer ${token}`);

                expect(res.status).toBe(200);

                expect(res.body).toBeInstanceOf(Object);
                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Successfully get all inventory data");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toBeInstanceOf(Array);

                res.body.data.forEach((item) => {
                    expect(item).toHaveProperty("id");
                    expect(item).toHaveProperty("isAvailable");
                    expect(item).toHaveProperty("itemName");
                    expect(item).toHaveProperty("quantity");
                    expect(item).toHaveProperty("category");
                    expect(item).toHaveProperty("location");
                    expect(item).toHaveProperty("description");
                    expect(item).toHaveProperty("pictureUrl");
                    expect(item).toHaveProperty("updatedAt");
                    expect(item).toHaveProperty("createdAt");
                });

                expect(resPagination.status).toBe(200);

                expect(resPagination.body).toBeInstanceOf(Object);
                expect(resPagination.body).toHaveProperty("status", "success");
                expect(resPagination.body).toHaveProperty("message", `Successfully get all inventory data, page: ${queryPagination.page}`);
                expect(resPagination.body).toHaveProperty("data");

                expect(resPagination.body.data).toHaveProperty("total");
                expect(resPagination.body.data).toHaveProperty("result");

                expect(resPagination.body.data.result).toBeInstanceOf(Array);

                resPagination.body.data.result.forEach((item) => {
                    expect(item).toHaveProperty("id");
                    expect(item).toHaveProperty("isAvailable");
                    expect(item).toHaveProperty("itemName");
                    expect(item).toHaveProperty("quantity");
                    expect(item).toHaveProperty("category");
                    expect(item).toHaveProperty("location");
                    expect(item).toHaveProperty("description");
                    expect(item).toHaveProperty("pictureUrl");
                    expect(item).toHaveProperty("updatedAt");
                    expect(item).toHaveProperty("createdAt");
                });
            });
            test("Success Get All Inventory Items with Sorting Filter based on itemName", async () => {
                const token = generateToken({ id: 1 })
                const query = {
                    sort: "ASC"
                }
                const queryPagination = {
                    limit: 5,
                    page: 1,
                    sort: "ASC"
                }

                const res = await request(app).get("/api/inventory/detail/all").query(query).set('Authorization', `Bearer ${token}`);
                const resPagination = await request(app).get("/api/inventory/detail/all").query(queryPagination).set('Authorization', `Bearer ${token}`);

                expect(res.status).toBe(200);

                expect(res.body).toBeInstanceOf(Object);
                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Successfully get all inventory data");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toBeInstanceOf(Array);

                res.body.data.forEach((item) => {
                    expect(item).toHaveProperty("id");
                    expect(item).toHaveProperty("isAvailable");
                    expect(item).toHaveProperty("itemName");
                    expect(item).toHaveProperty("quantity");
                    expect(item).toHaveProperty("category");
                    expect(item).toHaveProperty("location");
                    expect(item).toHaveProperty("description");
                    expect(item).toHaveProperty("pictureUrl");
                    expect(item).toHaveProperty("updatedAt");
                    expect(item).toHaveProperty("createdAt");
                });

                const checkSorted = isSorted(res.body.data, "itemName", query.sort);
                expect(checkSorted).toBe(true);

                expect(resPagination.status).toBe(200);

                expect(resPagination.body).toBeInstanceOf(Object);
                expect(resPagination.body).toHaveProperty("status", "success");
                expect(resPagination.body).toHaveProperty("message", `Successfully get all inventory data, page: ${queryPagination.page}`);
                expect(resPagination.body).toHaveProperty("data");

                expect(resPagination.body.data).toHaveProperty("total");
                expect(resPagination.body.data).toHaveProperty("result");

                expect(resPagination.body.data.result).toBeInstanceOf(Array);

                resPagination.body.data.result.forEach((item) => {
                    expect(item).toHaveProperty("id");
                    expect(item).toHaveProperty("isAvailable");
                    expect(item).toHaveProperty("itemName");
                    expect(item).toHaveProperty("quantity");
                    expect(item).toHaveProperty("category");
                    expect(item).toHaveProperty("location");
                    expect(item).toHaveProperty("description");
                    expect(item).toHaveProperty("pictureUrl");
                    expect(item).toHaveProperty("updatedAt");
                    expect(item).toHaveProperty("createdAt");
                });

                const checkSortedPagination = isSorted(resPagination.body.data.result, "itemName", queryPagination.sort);
                expect(checkSortedPagination).toBe(true);
            });
            test("Success Get All Inventory Items with Sorting Filter based on stock", async () => {
                const token = generateToken({ id: 1 })
                const query = {
                    sort_stock: "ASC"
                }
                const queryPagination = {
                    limit: 5,
                    page: 1,
                    sort_stock: "DESC"
                }

                const res = await request(app).get("/api/inventory/detail/all").query(query).set('Authorization', `Bearer ${token}`);
                const resPagination = await request(app).get("/api/inventory/detail/all").query(queryPagination).set('Authorization', `Bearer ${token}`);

                expect(res.status).toBe(200);

                expect(res.body).toBeInstanceOf(Object);
                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Successfully get all inventory data");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toBeInstanceOf(Array);

                res.body.data.forEach((item) => {
                    expect(item).toHaveProperty("id");
                    expect(item).toHaveProperty("isAvailable");
                    expect(item).toHaveProperty("itemName");
                    expect(item).toHaveProperty("quantity");
                    expect(item).toHaveProperty("category");
                    expect(item).toHaveProperty("location");
                    expect(item).toHaveProperty("description");
                    expect(item).toHaveProperty("pictureUrl");
                    expect(item).toHaveProperty("updatedAt");
                    expect(item).toHaveProperty("createdAt");
                });

                const checkSorted = isSorted(res.body.data, "quantity", query.sort_stock);
                expect(checkSorted).toBe(true);

                expect(resPagination.status).toBe(200);

                expect(resPagination.body).toBeInstanceOf(Object);
                expect(resPagination.body).toHaveProperty("status", "success");
                expect(resPagination.body).toHaveProperty("message", `Successfully get all inventory data, page: ${queryPagination.page}`);
                expect(resPagination.body).toHaveProperty("data");

                expect(resPagination.body.data).toHaveProperty("total");
                expect(resPagination.body.data).toHaveProperty("result");

                expect(resPagination.body.data.result).toBeInstanceOf(Array);

                resPagination.body.data.result.forEach((item) => {
                    expect(item).toHaveProperty("id");
                    expect(item).toHaveProperty("isAvailable");
                    expect(item).toHaveProperty("itemName");
                    expect(item).toHaveProperty("quantity");
                    expect(item).toHaveProperty("category");
                    expect(item).toHaveProperty("location");
                    expect(item).toHaveProperty("description");
                    expect(item).toHaveProperty("pictureUrl");
                    expect(item).toHaveProperty("updatedAt");
                    expect(item).toHaveProperty("createdAt");
                });

                const checkSortedPagination = isSorted(resPagination.body.data.result, "quantity", queryPagination.sort_stock);
                expect(checkSortedPagination).toBe(true);
            });
        });
        describe("Failed", () => {
            describe("Bad Request", () => {
                test("No User Id Exist in DB", async () => {
                    const token = generateToken({ id: 99 })

                    const res = await request(app).get("/api/inventory/detail/all").set('Authorization', `Bearer ${token}`);

                    expect(res.status).toBe(400);
                });
            });
            describe("Unauthorized", () => {
                test("No authorization bearer token", async () => {
                    const res = await request(app).get("/api/inventory/detail/all");

                    expect(res.status).toBe(401);
                });
            });
        });
    });

    describe("Get Detail Inventory Test", () => {
        describe("Success", () => {
            test("Success Get Detail Inventory Items", async () => {
                const token = generateToken({ id: 1 })
                const query = { id: 5 }

                const res = await request(app).get("/api/inventory/detail/").query(query).set('Authorization', `Bearer ${token}`);

                expect(res.status).toBe(200);
                expect(res.body).toBeInstanceOf(Object);

                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Successfully get detail inventory data");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toBeInstanceOf(Object);
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
                test("No User Id Exist in DB", async () => {
                    const token = generateToken({ id: 99 })

                    const res = await request(app).get("/api/inventory/detail").set('Authorization', `Bearer ${token}`);

                    expect(res.status).toBe(400);
                });

                test("No Item ID Provided", async () => {
                    const token = generateToken({ id: 1 })

                    const res = await request(app).get("/api/inventory/detail").set('Authorization', `Bearer ${token}`);

                    expect(res.status).toBe(400)
                });

                test("Item ID don\'t exist", async () => {
                    const token = generateToken({ id: 1 })
                    const query = { id: 999 }

                    const res = await request(app).get("/api/inventory/detail").query(query).set('Authorization', `Bearer ${token}`);

                    expect(res.status).toBe(400)
                });
            });
            describe("Unauthorized", () => {
                test("No authorization bearer token", async () => {
                    const res = await request(app).get("/api/inventory/detail");

                    expect(res.status).toBe(401);
                });
            });
        });
    });

    describe("Delete Inventory Test", () => {
        describe("Success", () => {
            test("Success Delete Inventory Item", async () => {
                const token = generateToken({ id: 1 })
                const query = { id: 13 }

                const res = await request(app).delete("/api/inventory/delete/").query(query).set('Authorization', `Bearer ${token}`);

                expect(res.status).toBe(200);
                expect(res.body).toBeInstanceOf(Object);

                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Successfully delete inventaris item");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toBeInstanceOf(Array);
                expect(res.body.data[0]).toHaveProperty("id");
                expect(res.body.data[0]).toHaveProperty("isAvailable");
                expect(res.body.data[0]).toHaveProperty("itemName");
                expect(res.body.data[0]).toHaveProperty("quantity");
                expect(res.body.data[0]).toHaveProperty("category");
                expect(res.body.data[0]).toHaveProperty("location");
                expect(res.body.data[0]).toHaveProperty("description");
                expect(res.body.data[0]).toHaveProperty("pictureUrl");
                expect(res.body.data[0]).toHaveProperty("updatedAt");
                expect(res.body.data[0]).toHaveProperty("createdAt");

                const resValidateDelete = await request(app).get("/api/inventory/detail/").query(query).set('Authorization', `Bearer ${token}`);

                expect(resValidateDelete.status).toBe(400);

                expect(resValidateDelete.body).toBeInstanceOf(Object);
                expect(resValidateDelete.body).toHaveProperty("status", "Failed");
                expect(resValidateDelete.body).toHaveProperty("message", "Item do not exists in inventory");
            });
        });
        describe("Failed", () => {
            describe("Bad Request", () => {
                test("No User Id Exist in DB", async () => {
                    const token = generateToken({ id: 99 })

                    const res = await request(app).delete("/api/inventory/delete").set('Authorization', `Bearer ${token}`);

                    expect(res.status).toBe(400);
                });
                test("Item don't exist in DB", async () => {
                    const token = generateToken({ id: 1 })
                    const query = {
                        id: 999
                    }

                    const res = await request(app).delete("/api/inventory/delete").query(query).set('Authorization', `Bearer ${token}`);

                    expect(res.status).toBe(400);
                });
                test("Item already been deleted", async () => {
                    const token = generateToken({ id: 1 })
                    const query = {
                        id: 13
                    }

                    const res = await request(app).delete("/api/inventory/delete").query(query).set('Authorization', `Bearer ${token}`);

                    expect(res.status).toBe(400);
                });
            });
            describe("Unauthorized", () => {
                test("No authorization bearer token", async () => {
                    const res = await request(app).delete("/api/inventory/delete");

                    expect(res.status).toBe(401);
                });
            });
            describe("Forbidden", () => {
                test("Authorization bearer token come from non-admin user", async () => {
                    const token = generateToken({ id: 2 })

                    const res = await request(app).delete("/api/inventory/delete").set('Authorization', `Bearer ${token}`);

                    expect(res.status).toBe(403);
                });
            });
        });
    });

    describe("Edit Inventory Test", () => {
        describe("Success", () => {
            test("Success Update Inventory Item", async () => {
                const token = generateToken({ id: 1 })
                const query = { id: 17 }
                const body = {
                    "itemName": "Update Test",
                    "quantity": 99897,
                    "category": "kategori test",
                    "location": "gedung test",
                    "isAvailable": true,
                    "description": "description test",
                    "pictureUrl": "url test"
                }

                const res = await request(app).put("/api/inventory/update/").query(query).set('Authorization', `Bearer ${token}`).send(body);

                expect(res.status).toBe(200);
                expect(res.body).toBeInstanceOf(Object);

                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("message", "Successfully edit inventaris item");
                expect(res.body).toHaveProperty("data");

                expect(res.body.data).toBeInstanceOf(Array);
                expect(res.body.data[0]).toBe(1);
                res.body.data[1].forEach((item) => {
                    expect(item).toHaveProperty("id");
                    expect(item).toHaveProperty("isAvailable");
                    expect(item).toHaveProperty("itemName");
                    expect(item).toHaveProperty("quantity");
                    expect(item).toHaveProperty("category");
                    expect(item).toHaveProperty("location");
                    expect(item).toHaveProperty("description");
                    expect(item).toHaveProperty("pictureUrl");
                    expect(item).toHaveProperty("updatedAt");
                    expect(item).toHaveProperty("createdAt");
                });

                const resValidateUpdate = await request(app).get("/api/inventory/detail/").query(query).set('Authorization', `Bearer ${token}`);

                expect(resValidateUpdate.status).toBe(200);

                expect(resValidateUpdate.body).toBeInstanceOf(Object);
                expect(resValidateUpdate.body).toHaveProperty("status", "success");
                expect(resValidateUpdate.body).toHaveProperty("message", "Successfully get detail inventory data");
                expect(resValidateUpdate.body).toHaveProperty("data");

                expect(resValidateUpdate.body.data).toBeInstanceOf(Object);
                expect(resValidateUpdate.body.data.id).toBe(query.id);
                expect(resValidateUpdate.body.data.isAvailable).toBe(body.isAvailable);
                expect(resValidateUpdate.body.data.itemName).toBe(body.itemName);
                expect(resValidateUpdate.body.data.quantity).toBe(body.quantity);
                expect(resValidateUpdate.body.data.category).toBe(body.category);
                expect(resValidateUpdate.body.data.location).toBe(body.location);
                expect(resValidateUpdate.body.data.description).toBe(body.description);
                expect(resValidateUpdate.body.data.pictureUrl).toBe(body.pictureUrl);
            });
        });
        describe("Failed", () => {
            describe("Bad Request", () => {
                test("No User Id Exist in DB", async () => {
                    const token = generateToken({ id: 99 })
                    const query = { id: 42 }
                    const body = {
                        "itemName": "testing alat updated",
                        "quantity": 999,
                        "category": "alat kesehatan jantung",
                        "location": "gedung C",
                        "isAvailable": true,
                        "description": "Lorem ipsum dolor sit amet consectetur",
                        "pictureUrl": "https://picsum.photos/seed/picsum/500/500"
                    }

                    const res = await request(app).put("/api/inventory/update").query(query).set('Authorization', `Bearer ${token}`).send(body);

                    expect(res.status).toBe(400);
                });
                test("Item don't exist in DB", async () => {
                    const token = generateToken({ id: 1 })
                    const query = { id: 999 }
                    const body = {
                        "itemName": "testing alat updated",
                        "quantity": 999,
                        "category": "alat kesehatan jantung",
                        "location": "gedung C",
                        "isAvailable": true,
                        "description": "Lorem ipsum dolor sit amet consectetur",
                        "pictureUrl": "https://picsum.photos/seed/picsum/500/500"
                    }

                    const res = await request(app).put("/api/inventory/update").query(query).set('Authorization', `Bearer ${token}`).send(body);

                    expect(res.status).toBe(400);
                });
            });
            describe("Unauthorized", () => {
                test("No authorization bearer token", async () => {
                    const query = { id: 42 }
                    const body = {
                        "itemName": "testing alat updated",
                        "quantity": 999,
                        "category": "alat kesehatan jantung",
                        "location": "gedung C",
                        "isAvailable": true,
                        "description": "Lorem ipsum dolor sit amet consectetur",
                        "pictureUrl": "https://picsum.photos/seed/picsum/500/500"
                    }

                    const res = await request(app).put("/api/inventory/update").query(query).send(body);

                    expect(res.status).toBe(401);
                });
            });
            describe("Forbidden", () => {
                test("Authorization bearer token come from non-admin user", async () => {
                    const token = generateToken({ id: 2 })
                    const query = { id: 42 }
                    const body = {
                        "itemName": "testing alat updated",
                        "quantity": 999,
                        "category": "alat kesehatan jantung",
                        "location": "gedung C",
                        "isAvailable": true,
                        "description": "Lorem ipsum dolor sit amet consectetur",
                        "pictureUrl": "https://picsum.photos/seed/picsum/500/500"
                    }

                    const res = await request(app).put("/api/inventory/update").query(query).set('Authorization', `Bearer ${token}`).send(body);

                    expect(res.status).toBe(403);
                });
            });
        });
    });
});