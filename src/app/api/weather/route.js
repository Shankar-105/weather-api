import { NextResponse } from "next/server";
import { fetchWeatherByCoordinates, fetchWeatherByQuery, searchLocations } from "../../services/weatherApi";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const query = searchParams.get("query")?.trim();
  const latitude = searchParams.get("lat");
  const longitude = searchParams.get("lon");

  try {
    if (mode === "search") {
      if (!query) {
        return jsonError("Query is required for location search.");
      }

      const results = await searchLocations(query);
      return NextResponse.json({ results });
    }

    if (latitude && longitude) {
      const weather = await fetchWeatherByCoordinates(latitude, longitude);
      return NextResponse.json(weather);
    }

    if (!query) {
      return jsonError("Provide a search query or coordinates.");
    }

    const weather = await fetchWeatherByQuery(query);
    return NextResponse.json(weather);
  } catch (error) {
    return jsonError(error.message || "Failed to load weather data", 502);
  }
}