import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API_URL from "../config";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const location = useLocation();
  const dataset = location.state?.dataset || "No dataset selected";
  const filters = location.state?.filters || {};
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (dataset && dataset !== "No dataset selected") {
      fetch(`${API_URL}/forecast/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset: dataset,
          target_column: "Arithmetic Mean",
          filters: filters
        })
      })
        .then((res) => res.json())
        .then((data) => setResult(data))
        .catch((err) => setError(err.message));
    }
  }, [dataset, filters]);

  const renderTable = () => {
    if (!result || !Array.isArray(result.forecast)) {
      return <p>No forecast data available</p>;
    }

    return (
      <table border="1" cellPadding="8" style={{ marginTop: "1rem", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {Object.keys(result.forecast[0]).map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.forecast.map((row, idx) => (
            <tr key={idx}>
              {Object.values(row).map((val, i) => (
                <td key={i}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderChart = () => {
    if (!result || !Array.isArray(result.forecast)) {
      return null;
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={result.forecast}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="forecast" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Dashboard</h2>
      <p>Currently selected dataset: <strong>{dataset}</strong></p>
      <p>Applied filters: <strong>{JSON.stringify(filters)}</strong></p>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {result ? (
        <div>
          <h3>Forecast Results</h3>
          {renderTable()}
          <h3>Forecast Chart</h3>
          {renderChart()}
        </div>
      ) : (
        <p>Loading forecast...</p>
      )}
    </div>
  );
}
