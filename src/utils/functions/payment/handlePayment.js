import axios from 'axios';
import {
  showDonationAlert,
  showDonationError,
  showDonationMakeError,
  showDonationSucces,
} from '../../helpers/notifications';
import { handleUpdateMaxPixelCount } from '../pixels/updateMaxPixelCount';

export const doPayment = async (paymentAmount, pixelCount = null, socket) => {
  try {
    if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
      showDonationAlert();
      return;
    }

    const maxRetries = 5;
    const createPaymentWithRetry = async () => {
      let retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_SERVER}/api/create-payment`,
            {
              amount: paymentAmount,
              description: pixelCount
                ? 'Оплата подписки'
                : 'Произвольная оплата',
            }
          );

          return response.data;
        } catch (error) {
          if (error.response && error.response.status === 429) {
            retryCount++;
            const waitTime = Math.pow(2, retryCount) * 500;
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          } else {
            throw error;
          }
        }
      }

      throw new Error('Превышено количество попыток. Оплата не удалась.');
    };

    const { confirmationUrl, paymentId } = await createPaymentWithRetry();

    window.open(confirmationUrl, '_blank');

    const checkPaymentStatus = () => {
      const interval = setInterval(async () => {
        try {
          const statusResponse = await axios.get(
            `${process.env.REACT_APP_SERVER}/api/check-payment/${paymentId}`
          );
          const { status } = statusResponse.data;

          if (status === 'succeeded') {
            clearInterval(interval);

            if (pixelCount) {
              handleUpdateMaxPixelCount(pixelCount, socket);
            }

            showDonationSucces();
          } else if (status === 'canceled' || status === 'failed') {
            clearInterval(interval);
            showDonationError();
          }
        } catch (error) {
          clearInterval(interval);
        }
      }, 3000);
    };

    checkPaymentStatus();
  } catch (error) {
    showDonationMakeError();
  }
};
