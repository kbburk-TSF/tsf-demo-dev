import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import DataUpload from "./components/DataUpload";
import HealthCheck from "./components/HealthCheck";
import JobsMonitor from "./components/JobsMonitor";

export default function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/upload">Upload CSV</Link>
        <Link to="/health">Health</Link>
        <Link to="/jobs">Jobs</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<DataUpload />} />
        <Route path="/health" element={<HealthCheck />} />
        <Route path="/jobs" element={<JobsMonitor />} />
      </Routes>
    </Router>
  );
}
