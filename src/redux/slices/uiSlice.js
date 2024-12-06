import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showAuthModal: true,
  showRulesModal: true,
  showControlPanel: JSON.parse(localStorage.getItem("showControlPanel")) ?? true, 
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleAuthModal(state) {
      state.showAuthModal = !state.showAuthModal;
    },
    toggleRulesModal(state) {
      state.showRulesModal = !state.showRulesModal;
    },
    toggleControlPanel(state) {
      state.showControlPanel = !state.showControlPanel;
      localStorage.setItem("showControlPanel", JSON.stringify(state.showControlPanel))
    },
  },
});

export const { toggleAuthModal, toggleRulesModal, toggleControlPanel } = uiSlice.actions;
export default uiSlice.reducer;
