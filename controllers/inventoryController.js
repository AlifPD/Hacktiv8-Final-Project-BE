const inventory = require('../db/models/inventory');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const db = require('../config/database.js');
const { Op } = require("sequelize");

const createInventoryItem = catchAsync(async (req, res, next) => {
    const body = req.body;

    const newInventoryItem = await inventory.create({
        itemName: body.itemName,
        quantity: body.quantity,
        category: body.category,
        location: body.location,
        description: body.description,
        pictureUrl: body.pictureUrl,
    });

    return res.status(201).json({
        status: 'success',
        message: 'Successfully create new item in inventory',
        data: newInventoryItem,
    });
});

const getAllInventory = catchAsync(async (req, res, next) => {
    const { limit, page, sort, sort_stock, search } = req.query;
    let result = [];
    let totalData;
    let searchQuery = {
        where: {}
    };
    let order;
    let sortDefault = [['id', 'ASC']];

    if (limit && page) {
        let query = `SELECT * FROM inventory`;
        let queryCount = `SELECT COUNT(*) as total FROM inventory WHERE inventory."deletedAt" IS NULL`;

        if (search !== '' && typeof search !== 'undefined') {
            query += ` WHERE inventory."itemName" ILIKE '%${search}%'AND inventory."deletedAt" IS NULL`
        } else {
            query += ` WHERE inventory."deletedAt" IS NULL`;
        }

        if (sort !== '' && typeof sort !== 'undefined') {
            if (sort == 'DESC') {
                query += ` ORDER BY inventory."itemName" DESC`
            } else if (sort == 'ASC') {
                query += ` ORDER BY inventory."itemName" ASC`
            }
        }

        if (sort_stock !== '' && typeof sort_stock !== 'undefined') {
            if (sort_stock == 'DESC') {
                query += ` ORDER BY inventory."quantity" DESC`
            } else if (sort_stock == 'ASC') {
                query += ` ORDER BY inventory."quantity" ASC`
            }
        }

        query += ` LIMIT ${limit} OFFSET ${(page - 1) * limit}`;

        result = await db.query(query, { type: db.QueryTypes.SELECT });
        totalData = await db.query(queryCount, { type: db.QueryTypes.SELECT });

        return res.status(200).json({
            status: 'success',
            message: `Successfully get all inventory data, page: ${page}`,
            data: {
                total: totalData[0].total,
                result: result,
            },
        });
    } else {
        searchQuery.where['deletedAt'] = { [Op.is]: null };
        order = [['id', 'ASC']];

        if (search !== '' && typeof search !== 'undefined') {
            searchQuery.where['itemName'] = { [Op.iLike]: `%${search}%` }
        }

        if (sort !== '' && typeof sort !== 'undefined') {
            if (sort == 'DESC') {
                order = [['itemName', 'DESC']];
            } else if (sort == 'ASC') {
                order = [['itemName', 'ASC']];
            }
        }

        if (sort_stock !== '' && typeof sort_stock !== 'undefined') {
            if (sort_stock == 'DESC') {
                order = [['quantity', 'DESC']];
            } else if (sort_stock == 'ASC') {
                order = [['quantity', 'ASC']];
            }
        }

        result = await inventory.findAll({
            where: searchQuery.where,
            order: order
        });

        return res.status(200).json({
            status: 'success',
            message: 'Successfully get all inventory data',
            data: result,
        });
    }
});

const getDetailInventory = catchAsync(async (req, res, next) => {
    if (!req.query.id) {
        throw new ApiError("Id don\'t exist", 400);
    }

    const result = await inventory.findByPk(req.query.id);

    if (!result) {
        throw new ApiError('Item do not exists in inventory', 400);
    }

    res.status(200).json({
        status: 'success',
        message: 'Successfully get detail inventory data',
        data: result,
    });
});

const deleteInventoryItem = catchAsync(async (req, res, next) => {
    const result = await inventory.destroy({
        where: {
            id: req.query.id
        },
        returning: true,
    });

    if (!result) {
        throw new ApiError('Data don\'t exists or Already been deleted', 400);
    }

    res.status(200).json({
        status: 'success',
        message: 'Successfully delete inventaris item',
        data: result,
    });
});

const editInventoryItem = catchAsync(async (req, res, next) => {
    const result = await inventory.update({
        itemName: req.body.itemName,
        quantity: req.body.quantity,
        category: req.body.category,
        location: req.body.location,
        description: req.body.description,
        pictureUrl: req.body.pictureUrl,
    }, {
        where: {
            id: req.query.id
        },
        returning: true,
    });

    if (!result) {
        throw new ApiError('Data don\'t exists or Already been deleted', 400);
    }

    res.status(200).json({
        status: 'success',
        message: 'Successfully edit inventaris item',
        data: result,
    });
});

module.exports = { createInventoryItem, getAllInventory, getDetailInventory, deleteInventoryItem, editInventoryItem };