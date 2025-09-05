import React, { useEffect, useState } from "react";
import API_BASE from "../config";

export default function JobsMonitor() {
  const [jobs, setJobs] = useState({});
  const [error, setError] = useState("");

  const loadJobs = () => {
    fetch(`${API_BASE}/jobs`)
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  if (error) return <div>Error: {error}</div>;
  return (
    <div>
      <h2>Upload Jobs</h2>
      <button onClick={loadJobs}>Refresh</button>
      <ul>
        {Object.keys(jobs).length === 0 && <li>No jobs yet</li>}
        {Object.entries(jobs).map(([id, job]) => (
          <li key={id}>
            Job {id}: {job.status}, {job.progress}% ({job.inserted}/{job.total})
            {job.message && <span style={{color:"red"}}> - {job.message}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
