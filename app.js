require('dotenv').config({ path: `${process.cwd()}/.env` });
const PORT = process.env.APP_PORT || 4000;

const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/authRoute');
const inventoryRouter = require('./routes/inventoryRoute');
const loansRouter = require('./routes/loansRoute');

const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/apiError');
const globalErrorHandler = require('./controllers/errorController');
const corsOptions = {
        origin: 'http://localhost:5173',
        optionsSuccessStatus: 200,
        Credentials: true
}


const app = express();
app.use(express.json());
app.use(cors(corsOptions));

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
    throw new AppError('Error, Route Not Found', 404);
}));

app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`SERVER RUNNING -> ${PORT}`);
});