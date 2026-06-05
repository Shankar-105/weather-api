"use client";

import { useState } from "react";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";

export default function Home() {
  const [temp, setTemp] = useState(null);

  return (
    <div className={`app ${getWeatherClass(temp)}`}>
      <div className="overlay">
        <h1 className="title">🌤 Weather App</h1>

        <SearchBar setTemp={setTemp} />
        <WeatherCard temp={temp} />
      </div>
    </div>
  );
}

// background logic to change the bg images according to the climate 
function getWeatherClass(temp) {
  if (!temp) return "default";
  if (temp < 15) return "cold";
  if (temp <= 28) return "normal";
  return "hot";
}