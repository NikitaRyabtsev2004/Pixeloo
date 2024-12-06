import React from 'react';
import PropTypes from 'prop-types';

export const UserSubscription = ({
  isAuthenticated,
  isSubscribed,
  pixelCount,
  DBmaxPixelCount,
  setIsOpenSubscription,
}) => {
  if (!isAuthenticated) return null;

  return (
    <>
      {isSubscribed || pixelCount > 100 ? (
        <>
          {DBmaxPixelCount < 400 && (
            <div className="isSubcribed">
              Вы подписаны
              <button onClick={() => setIsOpenSubscription(true)}>
                Увеличить подписку
              </button>
            </div>
          )}
          {DBmaxPixelCount === 400 && (
            <div className="isSubcribed">Максимальная подписка</div>
          )}
        </>
      ) : (
        <button className="server_button" style={{background:"lightgray"}} onClick={() => setIsOpenSubscription(true)}>
          Оформить подписку
        </button>
      )}
    </>
  );
};

UserSubscription.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  isSubscribed: PropTypes.bool.isRequired,
  pixelCount: PropTypes.number.isRequired,
  DBmaxPixelCount: PropTypes.number.isRequired,
  setIsOpenSubscription: PropTypes.func.isRequired,
};
