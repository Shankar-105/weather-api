import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import "./globals.css";

export default function Home() {
  return (
    <div className="app">
      <div className="overlay">
        <h1 className="title">🌤 Weather App</h1>

        <SearchBar />
        <WeatherCard />
      </div>
    </div>
  );
}