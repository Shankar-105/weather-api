"use client";

import { useState } from "react";
import "./SearchBar.css"
export default function SearchBar({ setTemp }) {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch() {
    if (!city.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:3000/weather?city=${city.trim()}`);

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend not running. Start NestJS: npm run start:dev");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "City not found");

      setTemp(data);
    } catch (err) {
      setError(err.message);
      setTemp(null);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Enter city name..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}