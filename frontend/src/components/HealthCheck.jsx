import React, { useState, useEffect } from "react";
import API_BASE from "../config";

export default function HealthCheck() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => setError(err.toString()));
  }, []);

  if (error) return <p>Health error: {error}</p>;
  if (!data) return <p>Loading health...</p>;

  return (
    <div>
      <h2>Health Check</h2>
      <p>API: {data.status}</p>
      <p>Database: {data.database}</p>
      <p>Schema: {data.schema}</p>
      <p>Rows in AirQuality: {data.rows ?? "N/A"}</p>
      {data.error && <p>Error: {data.error}</p>}
    </div>
  );
}
