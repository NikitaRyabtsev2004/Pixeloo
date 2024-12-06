import React from 'react';
import PropTypes from 'prop-types';

export const ServerStatus = ({ serverNumber, status }) => (
  <div>
    <p className="online_status">
      Статус сервера-{serverNumber}: {status}
    </p>
    {status === 'offline' && (
      <p className="status_alert">
        Техническое обслуживание. Пожалуйста, попробуйте позже или перезагрузите
        страницу
      </p>
    )}
  </div>
);

ServerStatus.propTypes = {
  serverNumber: PropTypes.string.isRequired,
  status: PropTypes.string,
};
