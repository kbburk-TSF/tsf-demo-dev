import React, { useEffect, useState } from "react";
import API_URL from "../config";

export default function JobsMonitor() {
  const [jobs, setJobs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchJobs() {
    try {
      const res = await fetch(`${API_URL}/jobs`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading jobs...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  const jobEntries = Object.entries(jobs);

  if (jobEntries.length === 0) {
    return <p>No jobs running.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Jobs Monitor</h2>
      <ul className="space-y-2">
        {jobEntries.map(([jobId, job]) => (
          <li key={jobId} className="p-3 border rounded shadow-sm bg-gray-50">
            <p><strong>ID:</strong> {jobId}</p>
            <p><strong>Status:</strong> {job.status}</p>
            <p><strong>Progress:</strong> {job.progress}%</p>
            <p><strong>Inserted:</strong> {job.inserted} | <strong>Failed:</strong> {job.failed}</p>
            <p><strong>Message:</strong> {job.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
