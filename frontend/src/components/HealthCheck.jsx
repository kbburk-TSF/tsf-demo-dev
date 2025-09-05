import React, { useEffect, useState } from "react";
import API_BASE from "../config";

export default function HealthCheck() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!health) return <div>Loading health status...</div>;

  return (
    <div>
      <h2>System Health</h2>
      <ul>
        <li>API: {health.status}</li>
        <li>Database: {health.database}</li>
        <li>Schema: {health.schema}</li>
        <li>Rows in AirQuality: {health.rows ?? "N/A"}</li>
      </ul>
    </div>
  );
}
