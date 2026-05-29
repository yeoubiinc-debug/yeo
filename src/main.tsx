import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applyInitialTheme } from "./lib/applyInitialTheme";

// Apply theme ASAP to avoid first-paint with default/static colors
applyInitialTheme().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});

