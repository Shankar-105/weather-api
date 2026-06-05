import "./WeatherCard.css";

export default function WeatherCard() {
  return (
    <div className="card">
      <h2>City: --</h2>
      <h3>Temperature: --°C</h3>
      <p>Condition: --</p>
    </div>
  );
}