import React from 'react';
import PropTypes from 'prop-types';

export const DonationButton = ({
  amount,
  isOpen,
  setAmount,
  setIsOpen,
  handleDoPayment,
}) => {
  return (
    <div className="donation_content">
      {isOpen ? (
        <div>
          <input
            type="number"
            placeholder="Введите сумму"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            onClick={() => handleDoPayment(parseFloat(amount))}
            className="server_button"
          >
            Пожертвовать
          </button>
          <button onClick={() => setIsOpen(false)} className="server_button">
            Отмена
          </button>
        </div>
      ) : (
        <div>
          <button className="server_button" onClick={() => setIsOpen(true)}>
            Поддержать проект
          </button>
        </div>
      )}
    </div>
  );
};

DonationButton.propTypes = {
  amount: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  setAmount: PropTypes.func.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  handleDoPayment: PropTypes.func.isRequired,
};
