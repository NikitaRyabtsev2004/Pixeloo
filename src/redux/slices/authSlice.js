import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: null,
  authStatus: '',
  resetPasswordFlow: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.authStatus = 'Вы успешно вошли в систему.';
      window.location.reload();
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.authStatus = 'Вы вышли из системы.';
      localStorage.removeItem('authToken');
      localStorage.removeItem('uniqueIdentifier');
      window.location.reload();
    },
    checkAuthStatus(state) {
      const token = localStorage.getItem('authToken');
      state.isAuthenticated = !!token;
    },
    setAuthStatus(state, action) {
      state.authStatus = action.payload;
    },
    toggleResetPasswordFlow(state, action) {
      state.resetPasswordFlow = action.payload ?? !state.resetPasswordFlow;
    },
  },
});

export const {
  loginSuccess,
  logout,
  checkAuthStatus,
  setAuthStatus,
  toggleResetPasswordFlow,
} = authSlice.actions;
export default authSlice.reducer;
