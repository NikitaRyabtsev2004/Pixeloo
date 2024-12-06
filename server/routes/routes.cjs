const authRoutes = require('./auth/auth.cjs');
const paymentRoutes = require('./payment/payment.cjs');
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const xss = require('xss-clean');
const { bruteforce } = require('../middlewares/rateBrute.cjs');
const { limiter } = require('../middlewares/rateLimiter.cjs');
const expressWinston = require('express-winston');
const winston = require('winston');

const app = express();

app.use(xss());
app.use(limiter);
app.use(helmet());
app.use(express.json());
app.use(bodyParser.json());
app.use(bruteforce.prevent);
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  })
);
app.use(
  expressWinston.logger({
    transports: [
      new winston.transports.File({ filename: process.env.REQUESTS_LOG }),
    ],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: true,
    colorize: false,
    ignoreRoute: function () {
      return false;
    },
  })
);

app.use('/auth', authRoutes);
app.use('/api', paymentRoutes);
module.exports = app;