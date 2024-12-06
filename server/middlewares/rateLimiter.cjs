const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
});

const createPaymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    status: 429,
    error: 'Превышен лимит запросов на создание платежей. Попробуйте позже.',
  },
});

const checkPaymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: {
    status: 429,
    error:
      'Превышен лимит запросов на проверку статуса платежей. Попробуйте позже.',
  },
});

module.exports = { limiter, createPaymentLimiter, checkPaymentLimiter };
