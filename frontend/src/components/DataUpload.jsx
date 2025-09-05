import React, { useState, useEffect } from "react";
import API_URL from "../config";

export default function DataUpload() {
  const [file, setFile] = useState(null);
  const [targetDb, setTargetDb] = useState("default");
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_db", targetDb);

    try {
      const res = await fetch(`${API_URL}/upload-csv`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setJobId(data.job_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Poll job status
  useEffect(() => {
    let interval;
    if (jobId) {
      const fetchStatus = async () => {
        try {
          const res = await fetch(`${API_URL}/jobs/${jobId}`);
          if (res.ok) {
            const data = await res.json();
            setJobStatus(data);
          }
        } catch (err) {
          console.error("Job status fetch failed", err);
        }
      };
      fetchStatus();
      interval = setInterval(fetchStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Upload CSV</h1>
      <form onSubmit={handleUpload} className="space-y-4">
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <div>
          <label className="mr-2">Target DB:</label>
          <input
            type="text"
            value={targetDb}
            onChange={(e) => setTargetDb(e.target.value)}
            className="border px-2 py-1"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {error && <p className="text-red-500">Error: {error}</p>}

      {jobId && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="font-bold">Upload Status</h2>
          <p><strong>Job ID:</strong> {jobId}</p>
          {jobStatus ? (
            <div>
              <p><strong>Status:</strong> {jobStatus.status}</p>
              <p><strong>Progress:</strong> {jobStatus.progress}%</p>
              <p><strong>Inserted:</strong> {jobStatus.inserted}</p>
              <p><strong>Failed:</strong> {jobStatus.failed}</p>
              <p><strong>Message:</strong> {jobStatus.message}</p>
            </div>
          ) : (
            <p>Fetching job status...</p>
          )}
        </div>
      )}
    </div>
  );
}
