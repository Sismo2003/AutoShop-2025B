import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "i18n/config";

import "simplebar-react/dist/simplebar.min.css";

import "styles/index.css";



import { Provider } from "react-redux";
import rootReducer from "./slices/index.js";
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
  reducer: rootReducer,
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
