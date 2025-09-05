import React, { useState } from "react";
import API_BASE from "../config";

export default function DataUpload() {
  const [file, setFile] = useState(null);
  const [targetDb, setTargetDb] = useState("AirQuality");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [failedFile, setFailedFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("dataset", targetDb);
    formData.append("file", file);

    try {
      setStatus("Uploading...");
      setError("");
      setProgress(0);
      setFailedFile(null);

      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setProgress(100);

      if (res.ok) {
        setFailedFile(data.failedFile);
        if (data.failed > 0 && data.success === 0) {
          setError(`${data.failed} rows failed. Upload rejected.`);
        } else if (data.failed > 0) {
          setStatus(`${data.failed} rows failed. ${data.success} uploaded.`);
        } else {
          setStatus("Upload complete! ✅");
        }
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("Upload failed. Check server logs.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload CSV</h2>
      <select value={targetDb} onChange={(e) => setTargetDb(e.target.value)}>
        <option value="AirQuality">Air Quality</option>
        <option value="Health">Health</option>
        <option value="Jobs">Jobs</option>
      </select>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      {progress > 0 && (
        <div style={{ marginTop: 10, width: "100%", background: "#eee", height: "20px" }}>
          <div
            style={{
              width: `${progress}%`,
              background: "blue",
              height: "100%",
              transition: "width 0.3s",
            }}
          ></div>
        </div>
      )}

      {status && <p style={{ color: "green" }}>{status}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {failedFile && (
        <a href={`${API_BASE}${failedFile}`} target="_blank" rel="noopener noreferrer">
          Download failed rows
        </a>
      )}
    </div>
  );
}
