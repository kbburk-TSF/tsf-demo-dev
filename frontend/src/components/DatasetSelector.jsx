import React from "react";

export default function DatasetSelector() {
  return (
    <div>
      <h2>Select Dataset</h2>
      <select>
        <option>demo_air_quality.csv</option>
        <option>demo_finance.csv</option>
        <option>demo_flight.csv</option>
      </select>
    </div>
  );
}
