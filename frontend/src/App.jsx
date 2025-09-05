import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import DataUpload from "./components/DataUpload";
import HealthCheck from "./components/HealthCheck";
import JobsMonitor from "./components/JobsMonitor";

export default function App() {
  return (
    <div>
      <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <Link to="/" style={{ margin: "0 10px" }}>Dashboard</Link>
        <Link to="/upload" style={{ margin: "0 10px" }}>Upload CSV</Link>
        <Link to="/health" style={{ margin: "0 10px" }}>Health</Link>
        <Link to="/jobs" style={{ margin: "0 10px" }}>Jobs</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<DataUpload />} />
        <Route path="/health" element={<HealthCheck />} />
        <Route path="/jobs" element={<JobsMonitor />} />
      </Routes>
    </div>
  );
}
