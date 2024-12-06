/* eslint-disable no-console */
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const createPayment = async (req, res) => {
  const { amount, description } = req.body;

  const idempotenceKey = uuidv4();

  const paymentData = {
    amount: {
      value: amount.toFixed(2),
      currency: 'RUB',
    },
    description: description,
    confirmation: {
      type: 'redirect',
      return_url: 'http://localhost:3000/payment-success',
    },
    capture: true,
  };

  try {
    const response = await axios.post(
      'https://api.yookassa.ru/v3/payments',
      paymentData,
      {
        headers: {
          'Idempotence-Key': idempotenceKey,
          'Content-Type': 'application/json',
        },
        auth: {
          username: process.env.SHOP_ID,
          password: process.env.SECRET_KEY,
        },
      }
    );
    console.log('Создан платеж с ID:', response.data.id);
    res.status(200).json({
      paymentId: response.data.id,
      confirmationUrl: response.data.confirmation.confirmation_url,
    });
  } catch (error) {
    console.error(
      'Ошибка при создании платежа:',
      error.response?.data || error.message
    );
    res.status(500).json({ message: 'Не удалось создать платеж' });
  }
};

module.exports = { createPayment };
