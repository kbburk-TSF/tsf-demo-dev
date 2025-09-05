import React, { useState } from "react";
import API_BASE from "../config";

export default function DataUpload() {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_db", "AirQuality");
    const res = await fetch(`${API_BASE}/upload-csv`, { method: "POST", body: formData });
    const data = await res.json();
    setJobId(data.job_id);
    pollStatus(data.job_id);
  };

  const pollStatus = (id) => {
    const interval = setInterval(async () => {
      const res = await fetch(`${API_BASE}/upload-status/${id}`);
      const data = await res.json();
      setStatus(data);
      if (data.status === "complete") clearInterval(interval);
    }, 2000);
  };

  return (
    <div>
      <h2>Upload CSV</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>

      {status && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Upload Status</h3>
          <p>Status: {status.status}</p>
          <p>
            Inserted: {status.inserted} / {status.total}
          </p>
          <p>Failed: {status.failed}</p>
          {status.message && <p>{status.message}</p>}

          <div style={{ border: "1px solid #ccc", width: "100%", height: "20px", marginTop: "0.5rem" }}>
            <div
              style={{
                width: `${status.progress || 0}%`,
                height: "100%",
                backgroundColor: "#4caf50",
              }}
            ></div>
          </div>
          <p>{status.progress || 0}% complete</p>
        </div>
      )}
    </div>
  );
}
