import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import DatasetSelector from "./components/DatasetSelector";
import DataUpload from "./components/DataUpload";
import HealthCheck from "./components/HealthCheck";

export default function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/dashboard">Dashboard</Link> |{" "}
        <Link to="/upload">Upload CSV</Link>
        <a href='/health'>Health</a>
</nav>
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<DataUpload />} />
      </Routes>
    </Router>
  );
}
