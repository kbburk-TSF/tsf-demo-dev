import React, { useState } from "react";
import API_BASE from "../config";

export default function DataUpload() {
  const [file, setFile] = useState(null);
  const [targetDb, setTargetDb] = useState("AirQuality");
  const [messages, setMessages] = useState([]);

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

      const eventSource = new EventSource(
        `${API_BASE}/upload-status/${job_id}`
      );
      eventSource.onmessage = (e) => {
        setMessages((prev) => [...prev, e.data]);
        if (e.data === "Upload complete!") {
          eventSource.close();
        }
      };
      eventSource.onerror = (err) => {
        setMessages((prev) => [...prev, "Error: Could not connect to backend"]);
        eventSource.close();
      };
    } catch (err) {
      setMessages((prev) => [...prev, `Error: ${err.message}`]);
    }
  };

  return (
    <div>
      <h2>Upload CSV</h2>
      <select value={targetDb} onChange={(e) => setTargetDb(e.target.value)}>
        <option value="AirQuality">AirQuality</option>
        <option value="Emissions">Emissions</option>
      </select>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
      <div>
        <h3>Status</h3>
        <ul>
          {messages.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
