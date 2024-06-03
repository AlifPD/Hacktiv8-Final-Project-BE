const users = require('../db/models/users');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (token) => {
    return jwt.sign(token, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES
    })
}

const signup = catchAsync(async (req, res, next) => {
    const body = req.body;
    // if (!['1'].includes(body.userType)) {
    //     throw new ApiError('Invalid User Type', 400);
    // }

    if (body.confirmPassword !== body.password) {
        throw new ApiError('Password and Confirm Password must be the same', 400);
    }

    if (body.password.length < 5) {
        throw new ApiError('Password length must have minimum of 8 characters', 400);
    }

    const newUser = await users.create({
        userName: body.userName,
        phoneNumber: body.phoneNumber,
        email: body.email,
        password: body.password,
        confirmPassword: body.confirmPassword,
    });

    if (!newUser) {
        throw new ApiError('Failed to create new user', 500);
    }

    const result = newUser.toJSON();

    delete result.password;
    delete result.deletedAt;

    result.token = generateToken({
        id: result.id,
    });

    return res.status(201).json({
        status: 'success',
        message: 'Successfully create new user',
        data: result,
    });
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email && !password) {
        throw new ApiError('Email and Password field can\'t be empty', 400);
    } else if (!email) {
        throw new ApiError('Email field can\'t be empty', 400);
    } else if (!password) {
        throw new ApiError('Password field can\'t be empty', 400);
    }

    const result = await users.findOne({
        where: { email }
    });

    if (!result || !(await bcrypt.compare(password, result.password))) {
        throw new ApiError('Incorrect email or password', 401);
    }

    const token = generateToken({
        id: result.id,
    });

    return res.status(200).json({
        status: 'success',
        message: 'Login Success',
        data: {
            id: result.id,
            token,
        },
    });
});

const getDetailUser = catchAsync(async (req, res, next) => {
    if (!req.query.id) {
        throw new ApiError('No ID inserted. Please provide user ID', 400);
    }

    const result = await users.findByPk(req.query.id);
    
    if (!result) {
        throw new ApiError('User do not exists', 400);
    } else {
        return res.status(200).json({
            status: 'success',
            message: 'Successfully get detail user data',
            data: result,
        })
    }
})

const authentication = catchAsync(async (req, res, next) => {
    let token = "";

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new ApiError('Not Authorized, Please Login', 401);
    }

    const tokenDetail = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userByToken = await users.findByPk(tokenDetail.id);

    if (!userByToken) {
        throw new ApiError('Failed Authenticating, User do not exists', 400);
    }

    req.user = userByToken;

    return next();
});

const restrictAccess = (...userType) => {
    const checkPermission = (req, res, next) => {
        if (!userType.includes(req.user.userType)) {
            return next(new ApiError('This user do not have permission to perform this action', 403));
        }

        return next();
    };

    return checkPermission;
};

module.exports = { signup, login, getDetailUser, authentication, restrictAccess };