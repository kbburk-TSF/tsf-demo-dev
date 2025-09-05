import React, { useState } from "react";
import API_BASE from "../config";

export default function DataUpload() {
  const [file, setFile] = useState(null);
  const [targetDb, setTargetDb] = useState("AirQuality");
  const [status, setStatus] = useState(null);
  const [jobId, setJobId] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_db", targetDb);

    const res = await fetch(`${API_BASE}/upload-csv`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setJobId(data.job_id);
    pollStatus(data.job_id);
  };

  const pollStatus = (id) => {
    const eventSource = new EventSource(`${API_BASE}/upload-status/${id}`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatus(data);
      if (data.status === "complete" || data.status === "error") {
        eventSource.close();
      }
    };
  };

  return (
    <div>
      <h2>Upload CSV</h2>
      <select value={targetDb} onChange={(e) => setTargetDb(e.target.value)}>
        <option value="AirQuality">AirQuality</option>
      </select>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {status && (
        <div>
          <p>Status: {status.status}</p>
          <p>Progress: {status.progress}%</p>
          <p>Inserted: {status.inserted} / {status.total}</p>
          <p>Failed: {status.failed}</p>
          {status.message && <p>{status.message}</p>}
          {status.failed > 0 && jobId && (
            <a href={`${API_BASE}/failed/${jobId}`} target="_blank" rel="noreferrer">
              Download failed rows
            </a>
          )}
        </div>
      )}
    </div>
  );
}
