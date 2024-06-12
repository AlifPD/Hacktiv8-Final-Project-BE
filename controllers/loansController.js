const loans = require('../db/models/loans');
const inventory = require('../db/models/inventory');
const users = require('../db/models/users');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const db = require('../config/database.js');
const { Op } = require("sequelize");

const createNewLoan = catchAsync(async (req, res, next) => {
    const checkIdUser = await users.findByPk(req.body.idUser);
    if (!checkIdUser) {
        throw new ApiError('The User doesn\'t exist', 400);
    }

    const checkIdItem = await inventory.findByPk(req.body.idItem);
    if (!checkIdItem) {
        throw new ApiError('The Item doesn\'t exist', 400);
    }

    const dateLoan = new Date(req.body.dateLoan);
    const dateReturn = new Date(req.body.dateReturn);
    const today = new Date();

    if (dateLoan.getFullYear() < today.getFullYear() ||
        (dateLoan.getFullYear() === today.getFullYear() && dateLoan.getMonth() < today.getMonth()) ||
        (dateLoan.getFullYear() === today.getFullYear() && dateLoan.getMonth() === today.getMonth() && dateLoan.getDate() < today.getDate())) {
        throw new ApiError('Loan Date must be after or at least today', 400);
    }


    if (dateReturn < dateLoan) {
        throw new ApiError('Return Date can\'t be before the Loan Date', 400);
    }

    if (req.body.quantity > checkIdItem.quantity) {
        throw new ApiError('Quantity of Loan can\'t exceed the quantity of item in inventory', 400);
    }

    if (req.body.quantity == 0) {
        throw new ApiError('Quantity of Loan can\'t be 0', 400);
    }

    if (req.body.quantity < 0) {
        throw new ApiError('Quantity of Loan is invalid', 400);
    }

    const loan = await loans.create({
        idItem: req.body.idItem,
        idUser: req.body.idUser,
        dateLoan: req.body.dateLoan,
        dateReturn: req.body.dateReturn,
        status: 'Sedang Dipinjam',
        quantity: req.body.quantity,
    });

    await inventory.update({
        quantity: checkIdItem.quantity - req.body.quantity
    }, {
        where: {
            id: checkIdItem.id
        }
    })

    return res.status(201).json({
        status: 'success',
        message: 'Successfully create new Loan',
        data: loan,
    });
});

const getLoan = catchAsync(async (req, res, next) => {
    const { limit, page, search } = req.query;
    let result = null;
    let totalData;
    let searchQuery = {
        where: {}
    };
    let order = [['id', 'ASC']];

    searchQuery.where['deletedAt'] = { [Op.is]: null };
    if (search !== '' && typeof search !== 'undefined') {
        searchQuery.where['itemName'] = { [Op.iLike]: `%${search}%` }
    }

    if (limit && page) {
        if (req.user.userType === '0') {
            let queryCount = `SELECT COUNT(*) as total FROM loans WHERE loans."deletedAt" IS NULL`;

            result = await loans.findAll({
                include: [{
                    model: users,
                    attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'] },
                }, {
                    model: inventory,
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                    where: searchQuery.where
                }],
                limit: limit,
                offset: (page - 1) * limit,
                order: order,
            });
            totalData = await db.query(queryCount, { type: db.QueryTypes.SELECT });
        } else {
            let queryCount = `SELECT COUNT(*) as total FROM loans WHERE loans."idUser" = ${req.user.id} AND loans."deletedAt" IS NULL`;

            result = await loans.findAll({
                where: { idUser: req.user.id },
                include: [{
                    model: users,
                    attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'] },
                }, {
                    model: inventory,
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                    where: searchQuery.where
                }],
                limit: limit,
                offset: (page - 1) * limit,
                order: order,
            });
            totalData = await db.query(queryCount, { type: db.QueryTypes.SELECT });
        }

        if (!result) {
            throw new ApiError('No Loan Data Existed', 400);
        }

        res.status(200).json({
            status: 'success',
            message: `Successfully get all loans, page ${page}`,
            data: {
                total: totalData[0].total,
                result: result,
            },
        });
    } else {
        if (req.user.userType === '0') {
            result = await loans.findAll({
                include: [{
                    model: users,
                    attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'] },
                }, {
                    model: inventory,
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                    where: searchQuery.where
                }],
                order: order,
            });
        } else {
            result = await loans.findAll({
                where: { idUser: req.user.id },
                include: [{
                    model: users,
                    attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'] },
                }, {
                    model: inventory,
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                    where: searchQuery.where
                }],
                order: order,
            });
        }

        if (!result) {
            throw new ApiError('No Loan Data Existed', 400);
        }

        res.status(200).json({
            status: 'success',
            message: 'Successfully get all loans',
            data: result
        });
    }
});

const getLoanDetail = catchAsync(async (req, res, next) => {
    const result = await loans.findAll({
        where: { id: req.query.id },
        include: [{
            model: users,
            attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'] },
        }, {
            model: inventory,
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
        }],
    });

    if (!result) {
        throw new ApiError('No Loan Data Existed', 400);
    }

    res.status(200).json({
        status: 'success',
        message: 'Successfully get loan detail',
        data: result
    });
});

const deleteLoan = catchAsync(async (req, res, next) => {
    const result = await loans.destroy({
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
        message: 'Successfully delete loan item',
        data: result,
    });
});

const editLoan = catchAsync(async (req, res, next) => {
    const validStatuses = ['Sedang Dipinjam', 'Belum Dikembalikan', 'Sudah Dikembalikan'];
    const { idItem, quantity, status } = req.body;
    const idPinjaman = req.query.id;

    if (!status) {
        throw new ApiError("No Status provided", 400);
    };

    if (!validStatuses.includes(status)) {
        throw new ApiError("New Status invalid", 400);
    };

    if (!idPinjaman) {
        throw new ApiError("No Id provided", 400);
    };

    let checkLoan = await loans.findOne({
        where: {
            id: idPinjaman
        }
    });
    if (!checkLoan) {
        throw new ApiError("Loan Id doesn\'t exist", 400);
    };

    const checkItem = await inventory.findByPk(idItem ? idItem : checkLoan.idItem);
    if (!checkItem) {
        throw new ApiError('The Item doesn\'t exist', 400);
    };

    let result = await loans.update({
        status: status,
    }, {
        where: {
            id: idPinjaman,
        },
        returning: true,
    });
    if (!result) {
        throw new ApiError("Loans does not exists or have been deleted", 400);
    };

    if (result && status == 'Sudah Dikembalikan') {
        await inventory.update({
            quantity: checkItem.quantity + checkLoan.quantity
        }, {
            where: {
                id: idItem,
            }
        })
    };

    return res.status(200).json({
        status: 'success',
        message: 'Successfully update loan item',
        data: result,
    });
});

module.exports = { createNewLoan, getLoan, deleteLoan, editLoan, getLoanDetail };