const ApiError = require('../utils/apiError');

const returnErrorDev = (error, res) => {
    const statusCode = error.statusCode || 500;
    const status = error.status || 'Error';
    const message = error.message;
    const stack = error.stack;

    res.status(statusCode).json({
        status,
        message,
        stack,
    });
};

const returnErrorProd = (error, res) => {
    const statusCode = error.statusCode || 500;
    const status = error.status || 'Error';
    const message = error.message;
    const stack = error.stack;

    if (error.isOperational) {
        res.status(statusCode).json({
            status,
            message,
        });
    }

    console.log(error.name, error.message, stack);

    return res.status(500).json({
        status: 'Error',
        message: 'Internal Server Error',
    });
};

const globalErrorHandler = (error, req, res, next) => {
    if (error.name === 'SequelizeUniqueConstraintError') {
        error = new ApiError(error.errors[0].message, 400);
    }
    if (error.name === 'SequelizeValidationError') {
        error = new ApiError(error.errors[0].message, 400);
    }
    if (error.name === 'JsonWebTokenError') {
        error = new ApiError('Invalid Token', 401);
    }

    if (process.env.NODE_ENV === 'development') {
        return returnErrorDev(error, res);
    }
    returnErrorProd(error, res);
}

module.exports = globalErrorHandler;