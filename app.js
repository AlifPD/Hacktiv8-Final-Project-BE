require('dotenv').config({ path: `${process.cwd()}/.env` });
const PORT = process.env.APP_PORT || 4000;

const express = require('express');
const cors = require('cors');
var cron = require('node-cron');
const loans = require('./db/models/loans');

const authRouter = require('./routes/authRoute');
const inventoryRouter = require('./routes/inventoryRoute');
const loansRouter = require('./routes/loansRoute');

const catchAsync = require('./utils/catchAsync');
const ApiError = require('./utils/apiError');
const globalErrorHandler = require('./controllers/errorController');
const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
    Credentials: true
}


const app = express();
app.use(express.json());
app.use(cors(corsOptions));

// cron.schedule('0 0 * * *', async () => {
//     console.log("HIT MIDNIGHT");
//     let loansData = await loans.findAll({
//         where: {
//             deletedAt: null,
//         }
//     });

//     loansData.forEach(async (value) => {
//         let result = await loans.update({
//             status: value.status
//         });
//     });

//     // let result = await loans.update({
//     //     idItem: req.body.idItem,
//     //     status: req.body.status,
//     //     quantity: req.body.quantity
//     // }, {
//     //     where: {
//     //         id: req.query.id
//     //     },
//     //     returning: true,
//     // });
// }, {
//     scheduled: true,
//     timezone: "Asia/Jakarta"
// });

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API RUNNING -> Base Route',
    });
});

app.use('/api/auth', authRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/loans', loansRouter);

app.use('*', catchAsync(async () => {
    throw new ApiError('Error, Route Not Found', 404);
}));

app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`SERVER RUNNING -> ${PORT}`);
    });
}

module.exports = app;