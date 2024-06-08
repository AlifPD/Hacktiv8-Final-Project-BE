require('dotenv').config({ path: `${process.cwd()}/.env` });

const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const cron = require('node-cron');

const authRouter = require('./routes/authRoute');
const inventoryRouter = require('./routes/inventoryRoute');
const loansRouter = require('./routes/loansRoute');

const catchAsync = require('./utils/catchAsync');
const ApiError = require('./utils/apiError');
const globalErrorHandler = require('./controllers/errorController');

const loans = require('./db/models/loans');

const PORT = process.env.APP_PORT || 4000;
let key, cert, httpsOptions;
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    optionsSuccessStatus: 200,
    credentials: true
}
const app = express();

app.use(express.json());
app.use(cors(corsOptions));

cron.schedule('0 0 * * *', async () => {
    console.log("HIT MIDNIGHT");
    let loansData = await loans.findAll({
        where: {
            deletedAt: null,
        }
    });

    const today = new Date();

    loansData.forEach(async (value, index) => {
        if (value.dateReturn.getFullYear() < today.getFullYear() ||
            (value.dateReturn.getFullYear() === today.getFullYear() && value.dateReturn.getMonth() < today.getMonth()) ||
            (value.dateReturn.getFullYear() === today.getFullYear() && value.dateReturn.getMonth() === today.getMonth() && value.dateReturn.getDate() < today.getDate())) {
            if (value.status == 'Sedang Dipinjam') {
                await loans.update({
                    status: "Belum Dikembalikan"
                }, {
                    where: {
                        id: value.id
                    },
                    returning: true,
                });
            }
        }
    });
}, {
    scheduled: true,
    timezone: "Asia/Jakarta"
});

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

if (process.env.NODE_ENV == 'production') {
    key = fs.readFileSync('/etc/letsencrypt/live/api-medinventory.my.id/privkey.pem');
    cert = fs.readFileSync('/etc/letsencrypt/live/api-medinventory.my.id/fullchain.pem');
}
let server = https.createServer(httpsOptions, app);

if (process.env.NODE_ENV == 'production') {
    server.listen(PORT, () => {
        console.log(`MEDINVENTORY API RUNNING ON PORT ${PORT}`);
    });
} else {
    app.listen(PORT, () => {
        console.log(`MEDINVENTORY API RUNNING ON PORT ${PORT}`);
    });
}

module.exports = app;