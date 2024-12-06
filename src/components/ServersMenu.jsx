import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';
import PropTypes from 'prop-types';

const CanvasSwitcher = ({ path }) => {
  const navigate = useNavigate();
  return (
    <button className="server_button" onClick={() => navigate(path)}>
      {path === '/canvas-1'
        ? 'Сервер-1'
        : path === '/canvas-2'
          ? 'Сервер-2'
          : 'Сервер-3'}
    </button>
  );
};

CanvasSwitcher.propTypes = {
  path: PropTypes.string.isRequired,
};

const ServersMenu = () => {
  const [showServersModal, setShowServersModal] = React.useState(false);

  return (
    <>
    <button
      className="servers"
      onClick={() => setShowServersModal((prevState) => !prevState)}
    >
      Сервера
      {showServersModal && (
        <div className="servers__list">
          <CanvasSwitcher path="/canvas-1" />
          <CanvasSwitcher path="/canvas-2" />
          <CanvasSwitcher path="/canvas-3" />
        </div>
      )}
    </button>
    </>
  );
};

export default ServersMenu;
