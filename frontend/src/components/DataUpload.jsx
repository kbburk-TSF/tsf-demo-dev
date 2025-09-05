import React, { useState } from "react";
import API_BASE from "../config";

export default function DataUpload() {
  const [file, setFile] = useState(null);
  const [targetDb, setTargetDb] = useState("AirQuality");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_db", targetDb);

    try {
      const res = await fetch(`${API_BASE}/upload-csv`, {
        method: "POST",
        body: formData,
      });
      const { job_id } = await res.json();

      const eventSource = new EventSource(`${API_BASE}/upload-status/${job_id}`);
      eventSource.onmessage = (e) => {
        const data = JSON.parse(e.data);
        setProgress(data.progress);
        setStatus(data.status);
        if (data.status === "Upload complete!") {
          eventSource.close();
        }
      };
      eventSource.onerror = () => {
        setStatus("Error: Could not connect to backend");
        eventSource.close();
      };
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Upload CSV</h2>
      <select value={targetDb} onChange={(e) => setTargetDb(e.target.value)}>
        <option value="AirQuality">AirQuality</option>
      </select>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
      <div>
        <h3>Status</h3>
        <progress value={progress} max="100"></progress>
        <p>{status} ({progress}%)</p>
      </div>
    </div>
  );
}
