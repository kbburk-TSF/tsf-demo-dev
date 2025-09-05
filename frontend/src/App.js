import React from "react";
import DatasetSelector from "./components/DatasetSelector";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <div className="App">
      <h1>TSF Demo Dashboard</h1>
      <DatasetSelector />
      <Dashboard />
    </div>
  );
}
