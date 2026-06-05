import SearchBar from "../components/SearchBar";
import WeatherCard from "../components/WeatherCard";

export default function Home() {
  return (
    <div className="container">
      <h1 className="title">Weather App ☀️</h1>

      <SearchBar />
      <WeatherCard />
    </div>
  );
}