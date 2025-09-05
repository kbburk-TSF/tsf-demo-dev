import React, { useState } from "react";
import axios from "axios";

function App() {
  const [dataset, setDataset] = useState("Air Quality");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [failedFile, setFailedFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("dataset", dataset);
    formData.append("file", file);

    try {
      const res = await axios.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { success, failed, failedFile } = res.data;
      setFailedFile(failedFile);

      if (failed > 0 && success === 0) {
        setMessage({ type: "error", text: `${failed} rows failed. Upload rejected.` });
      } else if (failed > 0) {
        setMessage({ type: "warning", text: `${failed} rows failed. ${success} rows uploaded.` });
      } else {
        setMessage({ type: "success", text: "Upload complete! ✅" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Upload failed. Please check server logs." });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload CSV</h2>
      <select value={dataset} onChange={(e) => setDataset(e.target.value)}>
        <option>Air Quality</option>
        <option>Health</option>
        <option>Jobs</option>
      </select>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>

      {message && (
        <p style={{ color: message.type === "error" ? "red" : message.type === "warning" ? "orange" : "green" }}>
          {message.text}
        </p>
      )}
      {failedFile && (
        <a href={failedFile} target="_blank" rel="noopener noreferrer">Download failed rows</a>
      )}
    </div>
  );
}

export default App;
