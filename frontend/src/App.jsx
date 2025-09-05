import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import DatasetSelector
import DataUpload from "./components/DataUpload" from "./components/DatasetSelector";

export default function App() {
  return (
    <Router>
      <nav style={{ padding: "1rem", background: "#eee" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/upload" style={{ marginLeft: "1rem" }}>Upload CSV</Link>
    </nav>
      <Routes>
        <Route path="/upload" element={<DataUpload />} />
        <Route path="/" element={<DatasetSelector />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
