/* eslint-disable no-console */
const axios = require('axios');

const checkPayment = async (req, res) => {
  const { paymentId } = req.params;

  try {
    const response = await axios.get(
      `https://api.yookassa.ru/v3/payments/${paymentId}`,
      {
        auth: {
          username: process.env.SHOP_ID,
          password: process.env.SECRET_KEY,
        },
      }
    );
    console.log('Получен запрос на проверку платежа с ID:', paymentId);
    res.status(200).json({ status: response.data.status });
  } catch (error) {
    console.error(
      'Ошибка при проверке статуса платежа:',
      error.response?.data || error.message
    );
    res.status(500).json({ message: 'Не удалось проверить статус платежа' });
  }
};

module.exports = { checkPayment };
