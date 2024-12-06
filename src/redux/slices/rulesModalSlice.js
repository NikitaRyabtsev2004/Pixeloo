import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  lastClosedTime: localStorage.getItem("rulesModalClosedTime")
    ? parseInt(localStorage.getItem("rulesModalClosedTime"), 10)
    : null,
};

const rulesModalSlice = createSlice({
    name: "rulesModal",
    initialState,
    reducers: {
      openModal(state) {
        state.isOpen = true;
      },
      closeModal(state) {
        state.isOpen = false;
        state.lastClosedTime = new Date().getTime();
        localStorage.setItem("rulesModalClosedTime", state.lastClosedTime);
      },
      resetTimer(state) {
        state.lastClosedTime = null;
        localStorage.removeItem("rulesModalClosedTime");
      },
      checkAutoOpen(state) {
        const currentTime = new Date().getTime();
        if (!state.lastClosedTime || currentTime - state.lastClosedTime >= 10 * 60 * 1000) {
          state.isOpen = true;
        }
      },
    },
  });
  
  export const { openModal, closeModal, resetTimer, checkAutoOpen } = rulesModalSlice.actions;
  export default rulesModalSlice.reducer;
  
