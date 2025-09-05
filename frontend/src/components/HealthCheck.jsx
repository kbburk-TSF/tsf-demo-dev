import React, { useEffect, useState } from "react";

export default function HealthCheck() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchHealth() {
    try {
      const res = await fetch("/health");
      if (!res.ok) throw new Error("Failed to fetch health");
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Checking system health...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div className="p-3 border rounded shadow-sm bg-green-50">
      <h2 className="text-xl font-bold mb-2">System Health</h2>
      <p>
        <strong>Status:</strong> {health.status}
      </p>
      <p>
        <strong>Database:</strong>{" "}
        {health.database === "up" ? (
          <span style={{ color: "green" }}>Up ✅</span>
        ) : (
          <span style={{ color: "red" }}>Down ❌</span>
        )}
      </p>
      {health.error && (
        <p style={{ color: "red" }}>
          <strong>Error:</strong> {health.error}
        </p>
      )}
    </div>
  );
}
