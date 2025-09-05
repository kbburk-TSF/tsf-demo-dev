import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import DataUpload from "./components/DataUpload";
import HealthCheck from "./components/HealthCheck";
import JobsMonitor from "./components/JobsMonitor";

export default function App() {
  return (
    <Router>
      <nav>
        <a href="/">Dashboard</a>
        <a href="/upload">Upload CSV</a>
        <a href="/health">Health</a>
        <a href="/jobs">Jobs</a>
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
