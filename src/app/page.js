"use client";

import { useState } from "react";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";

export default function Home() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadWeather(query) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/weather?query=${encodeURIComponent(query)}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Unable to load weather data");
      }

      setWeather(data);
    } catch (requestError) {
      setWeather(null);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadWeatherForCoordinates(latitude, longitude) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Unable to load weather data");
      }

      setWeather(data);
    } catch (requestError) {
      setWeather(null);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Open-Meteo powered</p>
          <h1>Find weather for any place, fast.</h1>
          <p className="hero-text">
            Search a city, town, or postcode and get current conditions plus a 5 day forecast in a polished dashboard.
          </p>
        </div>

        <SearchBar
          onSearch={loadWeather}
          onUseLocation={loadWeatherForCoordinates}
          loading={loading}
          error={error}
        />
      </section>

      <WeatherCard weather={weather} loading={loading} />
    </main>
  );
}