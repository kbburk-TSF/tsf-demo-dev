import React, { useState, useEffect } from "react";
import API_BASE from "../config";

export default function JobsMonitor() {
  const [jobs, setJobs] = useState({});

  useEffect(() => {
    fetch(`${API_BASE}/jobs`)
      .then((res) => res.json())
      .then(setJobs)
      .catch(() => setJobs({}));
  }, []);

  const jobList = Object.entries(jobs);

  return (
    <div>
      <h2>Jobs Monitor</h2>
      {jobList.length === 0 && <p>No jobs found</p>}
      {jobList.length > 0 && (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Inserted</th>
              <th>Total</th>
              <th>Failed</th>
              <th>Message</th>
              <th>Created</th>
              <th>Finished</th>
            </tr>
          </thead>
          <tbody>
            {jobList.map(([id, job]) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{job.status}</td>
                <td>{job.progress}%</td>
                <td>{job.inserted}</td>
                <td>{job.total}</td>
                <td>{job.failed}</td>
                <td>{job.message ?? ""}</td>
                <td>{job.created}</td>
                <td>{job.finished ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
