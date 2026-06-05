"use client";
import "./WeatherCard.css"
export default function WeatherCard({ temp }) {
  if (!temp) {
    return (
      <div className="weather-card empty">
        <p>Search a city to see the weather 🌍</p>
      </div>
    );
  }

  return (
    <div className="weather-card">
      <p className="city-name">{temp.city}, {temp.country}</p>
      <h2 className="temperature">{temp.temperature}</h2>
      <p className="condition">{temp.description}</p>
      <p className="feels-like">Feels like {temp.feels_like}</p>
    </div>
  );
}
