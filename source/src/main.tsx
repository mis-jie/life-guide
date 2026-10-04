import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

let isReloadingAfterHistoryTraversal = false;

function reloadAfterHistoryTraversal() {
  if (isReloadingAfterHistoryTraversal) return;
  isReloadingAfterHistoryTraversal = true;
  window.location.reload();
}

window.addEventListener("popstate", reloadAfterHistoryTraversal);
window.addEventListener("pageshow", (event) => {
  if (event.persisted) reloadAfterHistoryTraversal();
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
