import React from 'react';
import PropTypes from 'prop-types';

const CoordinateHint = ({ hoveredCoordinates, hoveredUsername }) => (
  <div className="Coordinations__Container">
    <div className="Pixel-Username__Row">
      {hoveredUsername && (
        <div className="Pixel-Username__container">
          <p>Никнейм: {hoveredUsername}</p>
        </div>
      )}
    </div>
    <div className="Coordinations">
      Координаты:
      <p>X: {hoveredCoordinates.x}</p>
      <p>Y: {hoveredCoordinates.y}</p>
    </div>
  </div>
);

CoordinateHint.propTypes = {
  hoveredCoordinates: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }).isRequired,
  hoveredUsername: PropTypes.string,
};

export default CoordinateHint;
