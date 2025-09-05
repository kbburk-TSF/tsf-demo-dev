import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DatasetSelector() {
  const [dataset, setDataset] = useState("");
  const [filterKey, setFilterKey] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dataset) {
      const filters = filterKey && filterValue ? { [filterKey]: filterValue } : {};
      navigate("/dashboard", { state: { dataset, filters } });
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Select a Dataset</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Dataset: </label>
          <select value={dataset} onChange={(e) => setDataset(e.target.value)}>
            <option value="">-- Choose a dataset --</option>
            <option value="demo_air_quality.csv">Air Quality</option>
            <option value="demo_finance.csv">Finance</option>
            <option value="demo_flight.csv">Flight</option>
          </select>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label>Filter Key: </label>
          <input
            type="text"
            value={filterKey}
            onChange={(e) => setFilterKey(e.target.value)}
            placeholder="e.g. State Name"
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label>Filter Value: </label>
          <input
            type="text"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            placeholder="e.g. California"
          />
        </div>

        <button type="submit" style={{ marginTop: "1rem" }}>Go</button>
      </form>
    </div>
  );
}
