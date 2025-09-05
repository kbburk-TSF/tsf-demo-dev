import React, { useState, useEffect } from "react";
import API_BASE from "../config";

export default function JobsMonitor() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/jobs`)
      .then((res) => res.json())
      .then(setJobs)
      .catch(() => setJobs([]));
  }, []);

  return (
    <div>
      <h2>Jobs Monitor</h2>
      {jobs.length === 0 && <p>No jobs found</p>}
      {jobs.length > 0 && (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Status</th>
              <th>Progress</th>
              <th>Inserted</th>
              <th>Total</th>
              <th>Failed</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(jobs).map((job, idx) => (
              <tr key={idx}>
                <td>{job.status}</td>
                <td>{job.progress}%</td>
                <td>{job.inserted}</td>
                <td>{job.total}</td>
                <td>{job.failed}</td>
                <td>{job.message ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
