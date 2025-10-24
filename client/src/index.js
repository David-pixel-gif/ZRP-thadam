import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

// ✅ Import your contexts
import { Web3Provider } from "./context/Web3Context";
import { AuthProvider } from "./context/AuthContext"; // optional, but good if you're already using it

// ✅ Wrap App with both providers so the entire app can access Web3 + Auth
ReactDOM.render(
  <AuthProvider>
    <Web3Provider>
      <App />
    </Web3Provider>
  </AuthProvider>,
  document.getElementById("root")
);

// You can register service worker for offline support, but it’s optional
serviceWorker.unregister();
