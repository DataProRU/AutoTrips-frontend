import { StrictMode, createContext } from "react";
import { createRoot } from "react-dom/client";
import "normalize.css";
import "./index.css";
import App from "./App.tsx";
import authStore from "./store/AuthStore.ts";

export const Context = createContext({ authStore });

createRoot(document.getElementById("root")!).render(
  <Context.Provider value={{ authStore }}>
    <StrictMode>
      <App />
    </StrictMode>
  </Context.Provider>
);
