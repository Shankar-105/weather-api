"use client";

import { useEffect, useState } from "react";
import "./SearchBar.css";

export default function SearchBar({ onSearch, onUseLocation, loading, error }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [helperMessage, setHelperMessage] = useState("");

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      const clearTimeoutId = window.setTimeout(() => {
        setSuggestions([]);
        setHelperMessage("");
      }, 0);

      return () => window.clearTimeout(clearTimeoutId);
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/weather?mode=search&query=${encodeURIComponent(trimmedQuery)}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Unable to search locations");
        }

        setSuggestions(data.results ?? []);
        setHelperMessage(data.results?.length ? "Select a match or press Enter for the top result." : "No matches yet.");
      } catch {
        setSuggestions([]);
        setHelperMessage("No matches yet.");
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  function formatLocation(location) {
    return [location.name, location.admin1, location.country].filter(Boolean).join(", ");
  }

  async function handleSearch(targetQuery = query) {
    const trimmedQuery = targetQuery.trim();

    if (!trimmedQuery) {
      return;
    }

    setSuggestions([]);
    await onSearch(trimmedQuery);
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setHelperMessage("Geolocation is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onUseLocation(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setHelperMessage("Location access was blocked or unavailable.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch(suggestions[0] ? formatLocation(suggestions[0]) : query);
    }
  }

  return (
    <div className="search-bar-shell">
      <div className="search-row">
        <div className="search-input-wrap">
          <input
            type="text"
            placeholder="Search a city, town, or postcode"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search location"
          />
        </div>

        <button className="primary-action" onClick={() => handleSearch()} disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      <div className="search-actions">
        <button className="ghost-action" onClick={handleUseLocation} disabled={loading}>
          Use my location
        </button>
        {helperMessage && <span className="status-pill">{helperMessage}</span>}
      </div>

      {suggestions.length > 0 && (
        <div className="suggestion-panel">
          {suggestions.map((location) => (
            <button
              key={`${location.id}-${location.latitude}-${location.longitude}`}
              type="button"
              className="suggestion-item"
              onClick={() => handleSearch(formatLocation(location))}
            >
              <span>{location.name}</span>
              <small>{[location.admin1, location.country].filter(Boolean).join(", ")}</small>
            </button>
          ))}
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}