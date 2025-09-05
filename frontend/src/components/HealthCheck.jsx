import React, { useEffect, useState } from "react";
import API_BASE from "../config";

export default function HealthCheck() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const loadHealth = () => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch((err) => setError(err.message));

    fetch(`${API_BASE}/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadHealth();
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!health) return <div>Loading health status...</div>;

  return (
    <div>
      <h2>System Health</h2>
      <button onClick={loadHealth}>Refresh</button>
      <ul>
        <li>API: {health.status}</li>
        <li>Database: {health.database}</li>
        <li>Schema: {health.schema}</li>
        <li>Rows in AirQuality: {health.rows ?? "N/A"}</li>
        {health.error && <li style={{color:"red"}}>Error: {health.error}</li>}
      </ul>
      {stats && stats.air_quality && (
        <div>
          <h3>Air Quality Stats</h3>
          <ul>
            <li>Total Rows: {stats.air_quality.rows}</li>
            <li>Earliest Date: {stats.air_quality.earliest_date}</li>
            <li>Latest Date: {stats.air_quality.latest_date}</li>
            <li>Last Updated: {stats.air_quality.last_updated}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
