"use client";

import "./WeatherCard.css";
import { getWeatherLabel, getWeatherSummary } from "../services/weatherApi";

function formatLocation(location) {
  return [location?.name, location?.admin1, location?.country].filter(Boolean).join(", ");
}

function formatDay(dateValue) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(new Date(dateValue));
}

export default function WeatherCard({ weather, loading }) {
  if (loading && !weather) {
    return (
      <section className="weather-card loading-state">
        <div className="skeleton hero-skeleton" />
        <div className="skeleton-grid">
          <div className="skeleton card-skeleton" />
          <div className="skeleton card-skeleton" />
          <div className="skeleton card-skeleton" />
          <div className="skeleton card-skeleton" />
          <div className="skeleton card-skeleton" />
        </div>
      </section>
    );
  }

  if (!weather) {
    return (
      <section className="weather-card empty">
        <p>Search a place or use your location to see the weather.</p>
      </section>
    );
  }

  const { location, current, daily } = weather;
  const forecastDays = daily.time.map((dateValue, index) => ({
    date: dateValue,
    code: daily.weatherCode[index],
    max: daily.temperatureMax[index],
    min: daily.temperatureMin[index],
    precipitation: daily.precipitationSum[index],
    precipitationChance: daily.precipitationProbabilityMax[index],
    wind: daily.windSpeedMax[index],
  }));

  return (
    <section className="weather-card">
      <div className="weather-hero">
        <div>
          <p className="city-name">{formatLocation(location)}</p>
          <p className="condition">{getWeatherLabel(current.weatherCode)}</p>
          <p className="subtle-copy">{getWeatherSummary(current.weatherCode)}</p>
        </div>

        <div className="temperature-block">
          <h2 className="temperature">{Math.round(current.temperature)}°</h2>
          <p className="feels-like">Feels like {Math.round(current.apparentTemperature)}°</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Humidity</span>
          <strong>{Math.round(current.humidity)}%</strong>
        </div>
        <div className="stat-card">
          <span>Wind</span>
          <strong>{Math.round(current.windSpeed)} km/h</strong>
        </div>
        <div className="stat-card">
          <span>Cloud cover</span>
          <strong>{Math.round(current.cloudCover)}%</strong>
        </div>
        <div className="stat-card">
          <span>Pressure</span>
          <strong>{Math.round(current.pressure)} hPa</strong>
        </div>
      </div>

      <div className="forecast-section">
        <div className="forecast-heading">
          <div>
            <h3>5 day forecast</h3>
            <p>Daily highs, lows, and precipitation chances.</p>
          </div>
        </div>

        <div className="forecast-grid">
          {forecastDays.map((day) => (
            <article className="forecast-card" key={day.date}>
              <span className="forecast-day">{formatDay(day.date)}</span>
              <strong className="forecast-code">{getWeatherLabel(day.code)}</strong>
              <div className="forecast-temps">
                <span>{Math.round(day.max)}°</span>
                <span>{Math.round(day.min)}°</span>
              </div>
              <p>{Math.round(day.precipitationChance)}% rain chance</p>
              <p>{Math.round(day.precipitation)} mm precipitation</p>
              <p>{Math.round(day.wind)} km/h wind</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}