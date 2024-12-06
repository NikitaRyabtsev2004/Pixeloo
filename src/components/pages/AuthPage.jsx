import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { checkAuthStatus, logout } from "../../redux/slices/authSlice";
import { getRandomColor } from "../../utils/helpers/helpers";
import { openModal } from "../../redux/slices/rulesModalSlice";
import AuthModal from "../modal/AuthModal.jsx";
import PropTypes from "prop-types";

const Logo = ({ colors, isAuthenticated, dispatch }) => {
  const [letterColors, setLetterColors] = useState(colors);

  const updateLetterColor = (key) => {
    const randomDelay = Math.random() * (1000 - 500) + 500;
    setTimeout(() => {
      setLetterColors((prevColors) => ({
        ...prevColors,
        [key]: getRandomColor(),
      }));
    }, randomDelay);
  };

  useEffect(() => {
    const letterKeys = Object.keys(letterColors);
    const intervals = letterKeys.map((key) =>
      setInterval(() => {
        updateLetterColor(key);
      }, Math.random() * (1000 - 500) + 500)
    );

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [letterColors]);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const handleShowRules = () => {
    dispatch(openModal());
  };

  return (
    <div className={`MainPage ${isAuthenticated ? "authenticated" : ""}`}>
      <div className="Logo">
        <h2 style={{ color: letterColors.P }}>P</h2>
        <h2 style={{ color: letterColors.i }}>i</h2>
        <h2 style={{ color: letterColors.x }}>x</h2>
        <h2 style={{ color: letterColors.e }}>e</h2>
        <h2 style={{ color: letterColors.l }}>l</h2>
        <h2 style={{ color: letterColors.o }}>o</h2>
        <h2 style={{ color: letterColors.o }}>o</h2>
      </div>

      {!isAuthenticated && <AuthModal onClose={() => {}} />}

      {isAuthenticated && (
        <div className="Main_buttons">
          <button className="server_button" onClick={() => dispatch(logout())}>
            Выйти
          </button>

          <button className="server_button" onClick={handleShowRules}>
            Правила
          </button>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  colors: state.colors.currentColors,
  isAuthenticated: state.auth.isAuthenticated,
});

Logo.propTypes = {
  colors: PropTypes.object.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(Logo);
