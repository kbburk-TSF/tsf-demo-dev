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
    setError("");
    setStatus("");
    setProgress(0);
    setFailedFile(null);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");
    setError("");
    setStatus("Starting upload…");
    setProgress(1); // ensure the bar is visible immediately

    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_db", targetDb);

    try {
      const res = await fetch(`${API_BASE}/upload-csv`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const maybeJson = await res.text();
        setError(maybeJson || "Upload request failed.");
        setProgress(0);
        return;
      }

      const { job_id } = await res.json();
      // Open SSE stream for live status updates
      const url = `${API_BASE}/upload-status/${job_id}`;
      const evtSource = new EventSource(url);

      // Make the bar clearly active while stream opens
      evtSource.onopen = () => {
        setStatus("Processing…");
        // keep at least a small visible progress so bar isn't invisible
        setProgress((p) => (p < 5 ? 5 : p));
      };

      evtSource.onerror = () => {
        // If the stream errors, keep the bar visible but show an actionable message
        setError("Live status connection interrupted. Upload may still complete.");
        setProgress((p) => (p < 10 ? 10 : p));
      };

      evtSource.onmessage = (event) => {
        const data = JSON.parse(event.data || "{}");

        // Progress/status from server
        if (typeof data.progress === "number") {
          // keep progress at least 5% to ensure visibility
          setProgress(data.progress > 5 ? data.progress : 5);
        }
        if (data.status) setStatus(data.status);
        if (data.message) setError(data.message);

        // Final state messaging + failed file link
        if (data.failed > 0 && (data.inserted || 0) === 0 && data.status === "complete") {
          setError(`${data.failed} rows failed. Upload rejected.`);
          setFailedFile(`/failed/${job_id}`);
        } else if (data.failed > 0 && data.status === "complete") {
          setStatus(`${data.failed} rows failed. ${(data.inserted || 0)} uploaded.`);
          setFailedFile(`/failed/${job_id}`);
        } else if (data.status === "complete") {
          setStatus("Upload complete! ✅");
          setFailedFile(null);
        }

        // Close on terminal state
        if (data.status === "complete" || data.status === "error") {
          // Ensure progress lands at 100 on completion
          setProgress((p) => (p < 100 ? 100 : p));
          evtSource.close();
        }
      };
    } catch (e) {
      setError("Network error during upload.");
      setProgress(0);
    }
  };

  return (
    <div>
      <h2>Upload CSV</h2>
      <label>
        Target Database:&nbsp;
        <select value={targetDb} onChange={(e) => setTargetDb(e.target.value)}>
          <option value="AirQuality">Air Quality</option>
        </select>
      </label>
      &nbsp;&nbsp;
      <input type="file" onChange={handleFileChange} />
      &nbsp;&nbsp;
      <button onClick={handleUpload}>Upload</button>

      <div style={{ marginTop: "12px" }}>
        {/* Always render progress; ensure visibility even at low percentages */}
        <progress value={progress} max="100" style={{ width: "100%" }} />
        <p>{status}</p>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {status === "complete" && <p style={{ color: "green" }}>✅ Upload complete!</p>}
        {failedFile && (
          <a href={`${API_BASE}${failedFile}`} target="_blank" rel="noopener noreferrer">
            Download failed rows
          </a>
        )}
      </div>
    </div>
  );
}
