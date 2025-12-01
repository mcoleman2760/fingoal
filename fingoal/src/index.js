import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./auth/AuthContext"; 
import { MonthProvider } from "./state/MonthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <MonthProvider>
        <App />
      </MonthProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
