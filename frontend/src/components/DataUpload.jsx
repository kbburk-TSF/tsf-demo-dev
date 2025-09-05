import React, { useState } from "react";
import API_URL from "../config";

export default function DataUpload() {
  const [file, setFile] = useState(null);
  const [targetDb, setTargetDb] = useState("AirQuality");
  const [messages, setMessages] = useState([]);
  const [jobId, setJobId] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_db", targetDb);

    const res = await fetch(`${API_URL}/upload-csv`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    setJobId(data.job_id);
    listenForUpdates(data.job_id);
  };

  const listenForUpdates = (jobId) => {
    const evtSource = new EventSource(`${API_URL}/upload-status/${jobId}`);
    evtSource.onmessage = (e) => {
      setMessages((prev) => [...prev, e.data]);
      if (e.data.includes("Upload complete!") || e.data.includes("Error")) {
        evtSource.close();
      }
    };
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>CSV Upload</h2>
      <label>
        Target Database:
        <select value={targetDb} onChange={(e) => setTargetDb(e.target.value)}>
          <option value="AirQuality">Air Quality</option>
          <option value="Emissions">Emissions</option>
        </select>
      </label>
      <br /><br />
      <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
      <br /><br />
      <button onClick={handleUpload}>Upload CSV</button>

      <h3>Status</h3>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
