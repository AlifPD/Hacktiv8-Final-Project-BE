const inventory = require('../db/models/inventory');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');

const createInventoryItem = catchAsync(async (req, res, next) => {
    const body = req.body;

    const newInventoryItem = await inventory.create({
        itemName: body.itemName,
        quantity: body.quantity,
        category: body.category,
        location: body.location,
        isAvailable: body.isAvailable,
        description : body.description,
        pictureUrl: body.pictureUrl,
    });

    return res.status(201).json({
        status: 'success',
        message: 'Successfully create new item in inventory',
        data: newInventoryItem,
    });
});

const getAllInventory = catchAsync(async (req, res, next) => {
    // const { limit = 20, page = 1 } = req.query;

    // const result = await inventory.findAll({ limit: limit, offset: (limit*page) });
    const result = await inventory.findAll();

    return res.status(200).json({
        status: 'success',
        message: 'Successfully get all inventory data',
        data: result,
    });
});

const getDetailInventory = catchAsync(async (req, res, next) => {
    if (!req.query.id) {
        res.status(200).json({
            status: 'success',
            message: 'Successfully get detail inventory data',
            data: [{}],
        });
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
            id: req.body.id
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

module.exports = { createInventoryItem, getAllInventory, getDetailInventory, deleteInventoryItem };