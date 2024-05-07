const loans = require('../db/models/loans');
const inventory = require('../db/models/inventory');
const users = require('../db/models/users');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');

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

    if (dateReturn < dateLoan) {
        throw new ApiError('Return Date can\'t be before the Loan Date', 400);
    }

    const loan = await loans.create({
        idItem: req.body.idItem,
        idUser: req.body.idUser,
        dateLoan: req.body.dateLoan,
        dateReturn: req.body.dateReturn,
        status: req.body.status,
    });

    return res.status(201).json({
        status: 'success',
        message: 'Successfully create new Loan',
        data: loan,
    });
});

const getLoan = catchAsync(async (req, res, next) => {
    let result = null;

    if (req.user.userType === '0') {
        result = await loans.findAll({
            include: [{
                model: users,
                attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'] },
            }, {
                model: inventory,
                attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
            }],
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
            }],
        });
    }

    if (!result) {
        throw new ApiError('No Loan Data Existed', 400);
    }

    res.status(200).json({
        status: 'success',
        message: 'Successfully get all loans',
        data: result,
    });
});

const deleteLoan = catchAsync(async (req, res, next) => {
    const result = await loans.destroy({
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
        message: 'Successfully delete loan item',
        data: result,
    });
});

module.exports = { createNewLoan, getLoan, deleteLoan };