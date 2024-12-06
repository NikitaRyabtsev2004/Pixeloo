import React from 'react';
import PropTypes from 'prop-types';

export const SubscribtionModal = ({
  isOpenSubscription,
  setIsOpenSubscription,
  DBmaxPixelCount,
  socket,
  doPayment,
}) => {
  if (!isOpenSubscription) return null;
  if (!socket) {
    return null
  }

  const subscriptionOptions = [
    { cost: 99, limit: 200, text: 'Увеличение лимита до 200PX' },
    { cost: 179, limit: 300, text: 'Увеличение лимита до 300PX' },
    { cost: 259, limit: 400, text: 'Увеличение лимита до 400PX' },
  ];

  return (
    <div className="SubscriptionModal__Content">
      {subscriptionOptions.map(
        ({ cost, limit, text }) =>
          DBmaxPixelCount < limit && (
            <button
              key={limit}
              onClick={() => doPayment(cost, limit, socket)}
              className="server_button"
            >
              <p className="Subscription__cost">Оформить подписку за {cost}₽</p>
              <p className="Subscription__info">{text}</p>
            </button>
          )
      )}
      <button
        onClick={() => setIsOpenSubscription(false)}
        className="server_button"
      >
        Отмена
      </button>
    </div>
  );
};

SubscribtionModal.propTypes = {
  isOpenSubscription: PropTypes.bool.isRequired,
  setIsOpenSubscription: PropTypes.func.isRequired,
  DBmaxPixelCount: PropTypes.number.isRequired,
  socket: PropTypes.object.isRequired,
  doPayment: PropTypes.func.isRequired,
};