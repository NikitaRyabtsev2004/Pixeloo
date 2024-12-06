import React, { useEffect } from 'react';
import './styles/App.css';
import Logo from './components/pages/AuthPage.jsx';
import RulesModal from './components/modal/RulesModal.jsx';
import ServersMenu from './components/ServersMenu.jsx';
import Canvas from './components/pages/Canvas';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from './redux/slices/authSlice';
import { closeModal, checkAutoOpen } from './redux/slices/rulesModalSlice';

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isOpen } = useSelector((state) => state.rulesModal);

  useEffect(() => {
    dispatch(checkAuthStatus());
    dispatch(checkAutoOpen());
  }, [dispatch]);

  return (
    <Router>
      <div className="App">
        <Logo />
        {isOpen && <RulesModal onClose={() => dispatch(closeModal())} />}
        <ServersMenu />
        <Routes>
          <Route
            path="/canvas-1"
            element={<Canvas isAuthenticated={isAuthenticated} />}
          />
          <Route
            path="/canvas-2"
            element={<Canvas isAuthenticated={isAuthenticated} />}
          />
          <Route
            path="/canvas-3"
            element={<Canvas isAuthenticated={isAuthenticated} />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
