import React from 'react';
import { useDispatch } from 'react-redux';
import { toggleControlPanel } from '../../redux/slices/uiSlice';
import { ColorPalette } from './ColorPalette.jsx';
import PropTypes from 'prop-types';

export const ColorSelector = ({
  isAuthenticated,
  showControlPanel,
  selectedColor,
  setSelectedColor,
  recentColors
}) => {
  const dispatch = useDispatch();

  return (
    isAuthenticated && (
      <div className="color__selector__container">
        <button
          className="toggle__control__panel"
          onClick={() => dispatch(toggleControlPanel())}
        >
          {showControlPanel ? 'Скрыть панель' : 'Показать панель'}
        </button>

        <ColorPalette
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />

        <h3>Ваш цвет: {selectedColor}</h3>
        <h3>Недавние цвета:</h3>

        <div className="recent__colors__container">
          <div className="recent__colors">
            {recentColors.map((color, index) => (
              <div
                key={index}
                onClick={() => setSelectedColor(color)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedColor(color);
                  }
                }}
                role="button"
                tabIndex={0}
                className="recent__color"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  );
};

// Определение типов пропсов
ColorSelector.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  showControlPanel: PropTypes.bool.isRequired,
  selectedColor: PropTypes.string.isRequired,
  setSelectedColor: PropTypes.func.isRequired,
  recentColors: PropTypes.arrayOf(PropTypes.string).isRequired
};

