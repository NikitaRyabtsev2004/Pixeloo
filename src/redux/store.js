import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import colorsReducer from "./slices/colorsSlice";
import rulesModalReducer from "./slices/rulesModalSlice";
import recentColors from "./slices/recentColorsSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    colors: colorsReducer,
    rulesModal: rulesModalReducer,
    recentColors: recentColors,
  },
});
