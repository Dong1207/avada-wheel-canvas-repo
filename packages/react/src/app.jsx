import React from "react";
import {createRoot} from "react-dom/client";
import {LuckyWheel, LuckyGrid, SlotMachine} from "./index";

function App() {
  return (
    <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
      <LuckyWheel />
      <LuckyGrid />
      <SlotMachine />
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
