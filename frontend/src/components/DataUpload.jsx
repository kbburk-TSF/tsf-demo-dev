import React, { useState } from "react";

export default function DataUpload() {
  const [file, setFile] = useState(null);
  const [targetDb, setTargetDb] = useState("default");
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState(null);
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
      const res = await fetch("/upload-csv", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Upload failed");
      }
      const data = await res.json();
      setJobId(data.job_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

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
        <p className="mt-4">
          Upload started. Track progress in{" "}
          <a href="/jobs" className="text-blue-600 underline">
            Jobs Monitor
          </a>{" "}
          (Job ID: <code>{jobId}</code>)
        </p>
      )}
    </div>
  );
}
