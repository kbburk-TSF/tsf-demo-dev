import React, { useState } from "react";
import API_BASE from "../config";

export default function DataUpload() {
  const [file, setFile] = useState(null);
  const [targetDb, setTargetDb] = useState("AirQuality");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_db", targetDb);

    const res = await fetch(`${API_BASE}/upload-csv`, {
      method: "POST",
      body: formData,
    });
    const { job_id } = await res.json();

    const evtSource = new EventSource(`${API_BASE}/upload-status/${job_id}`);
    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data.progress || 0);
      setStatus(data.status);
      if (data.message) setError(data.message);
      if (data.status === "complete" || data.status === "error") {
        evtSource.close();
      }
    };
  };

  return (
    <div>
      <h2>Upload CSV</h2>
      <select value={targetDb} onChange={(e) => setTargetDb(e.target.value)}>
        <option value="AirQuality">Air Quality</option>
      </select>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <div>
        <progress value={progress} max="100" />
        <p>{status}</p>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {status === "complete" && <p style={{ color: "green" }}>✅ Upload complete!</p>}
      </div>
    </div>
  );
}
