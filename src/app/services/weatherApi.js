const OPEN_METEO_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const WEATHER_CODE_LABELS = {
	0: "Clear sky",
	1: "Mostly clear",
	2: "Partly cloudy",
	3: "Overcast",
	45: "Fog",
	48: "Rime fog",
	51: "Light drizzle",
	53: "Drizzle",
	55: "Dense drizzle",
	56: "Freezing drizzle",
	57: "Dense freezing drizzle",
	61: "Light rain",
	63: "Rain",
	65: "Heavy rain",
	66: "Freezing rain",
	67: "Heavy freezing rain",
	71: "Light snow",
	73: "Snow",
	75: "Heavy snow",
	77: "Snow grains",
	80: "Light showers",
	81: "Showers",
	82: "Violent showers",
	85: "Light snow showers",
	86: "Heavy snow showers",
	95: "Thunderstorm",
	96: "Thunderstorm with hail",
	99: "Thunderstorm with hail",
};

const ALLOWED_FEATURE_PREFIXES = ["ADM", "PPL", "PCL", "CONT"];

function isAllowedLocation(location) {
	const featureCode = String(location.feature_code ?? "");
	return ALLOWED_FEATURE_PREFIXES.some((prefix) => featureCode.startsWith(prefix));
}

function rankLocation(location, query) {
	const featureCode = String(location.feature_code ?? "");
	const normalizedName = String(location.name ?? "").toLowerCase();
	const normalizedQuery = query.toLowerCase();

	let score = 0;

	if (normalizedName === normalizedQuery) {
		score += 100;
	} else if (normalizedName.startsWith(normalizedQuery)) {
		score += 60;
	} else if (normalizedName.includes(normalizedQuery)) {
		score += 30;
	}

	if (featureCode.startsWith("PPLC")) score += 50;
	if (featureCode.startsWith("PPLA")) score += 40;
	if (featureCode.startsWith("PPL")) score += 30;
	if (featureCode.startsWith("ADM1")) score += 28;
	if (featureCode.startsWith("ADM2")) score += 24;
	if (featureCode.startsWith("ADM3")) score += 20;
	if (featureCode.startsWith("ADM4")) score += 16;
	if (featureCode.startsWith("PCL")) score += 14;

	return score;
}

function buildForecastUrl(latitude, longitude) {
	const url = new URL(OPEN_METEO_FORECAST_URL);

	url.searchParams.set("latitude", latitude);
	url.searchParams.set("longitude", longitude);
	url.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation,pressure_msl");
	url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset");
	url.searchParams.set("forecast_days", "5");
	url.searchParams.set("timezone", "auto");
	url.searchParams.set("temperature_unit", "celsius");
	url.searchParams.set("wind_speed_unit", "kmh");
	url.searchParams.set("precipitation_unit", "mm");
	url.searchParams.set("timeformat", "iso8601");

	return url;
}

function toSearchResult(location) {
	return {
		id: location.id,
		name: location.name,
		admin1: location.admin1 ?? "",
		country: location.country ?? "",
		countryCode: location.country_code ?? "",
		latitude: location.latitude,
		longitude: location.longitude,
		timezone: location.timezone ?? "",
	};
}

function normalizeWeatherPayload(location, forecast) {
	return {
		location: {
			name: location.name,
			admin1: location.admin1 ?? "",
			country: location.country ?? "",
			countryCode: location.country_code ?? "",
			latitude: forecast.latitude,
			longitude: forecast.longitude,
			timezone: forecast.timezone,
		},
		current: {
			temperature: forecast.current?.temperature_2m ?? null,
			apparentTemperature: forecast.current?.apparent_temperature ?? null,
			humidity: forecast.current?.relative_humidity_2m ?? null,
			weatherCode: forecast.current?.weather_code ?? null,
			weatherDescription: WEATHER_CODE_LABELS[forecast.current?.weather_code] ?? "Unknown",
			windSpeed: forecast.current?.wind_speed_10m ?? null,
			windDirection: forecast.current?.wind_direction_10m ?? null,
			cloudCover: forecast.current?.cloud_cover ?? null,
			precipitation: forecast.current?.precipitation ?? null,
			pressure: forecast.current?.pressure_msl ?? null,
			time: forecast.current?.time ?? null,
		},
		daily: {
			time: forecast.daily?.time ?? [],
			weatherCode: forecast.daily?.weather_code ?? [],
			temperatureMax: forecast.daily?.temperature_2m_max ?? [],
			temperatureMin: forecast.daily?.temperature_2m_min ?? [],
			apparentTemperatureMax: forecast.daily?.apparent_temperature_max ?? [],
			apparentTemperatureMin: forecast.daily?.apparent_temperature_min ?? [],
			precipitationSum: forecast.daily?.precipitation_sum ?? [],
			precipitationProbabilityMax: forecast.daily?.precipitation_probability_max ?? [],
			windSpeedMax: forecast.daily?.wind_speed_10m_max ?? [],
			windGustsMax: forecast.daily?.wind_gusts_10m_max ?? [],
			sunrise: forecast.daily?.sunrise ?? [],
			sunset: forecast.daily?.sunset ?? [],
		},
	};
}

async function fetchJson(url) {
	const response = await fetch(url, {
		headers: {
			Accept: "application/json",
		},
		cache: "no-store",
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data?.reason || data?.error || "Weather provider request failed");
	}

	return data;
}

export async function searchLocations(query) {
	const trimmedQuery = query.trim();

	if (!trimmedQuery) {
		return [];
	}

	const url = new URL(OPEN_METEO_GEOCODING_URL);
	url.searchParams.set("name", trimmedQuery);
	url.searchParams.set("count", "8");
	url.searchParams.set("language", "en");
	url.searchParams.set("format", "json");

	const data = await fetchJson(url);
	return (data.results ?? [])
		.filter(isAllowedLocation)
		.sort((left, right) => rankLocation(right, trimmedQuery) - rankLocation(left, trimmedQuery))
		.slice(0, 8)
		.map(toSearchResult);
}

export async function fetchWeatherByLocation(location) {
	const forecastUrl = buildForecastUrl(location.latitude, location.longitude);
	const forecast = await fetchJson(forecastUrl);
	return normalizeWeatherPayload(location, forecast);
}

export async function fetchWeatherByQuery(query) {
	const matches = await searchLocations(query);

	if (!matches.length) {
		throw new Error("No matching locations found");
	}

	return fetchWeatherByLocation(matches[0]);
}

export async function fetchWeatherByCoordinates(latitude, longitude) {
	const forecastUrl = buildForecastUrl(latitude, longitude);
	const forecast = await fetchJson(forecastUrl);

	return normalizeWeatherPayload(
		{
			name: "Your location",
			admin1: "",
			country: "",
			country_code: "",
			latitude,
			longitude,
		},
		forecast
	);
}

export function getWeatherLabel(code) {
	return WEATHER_CODE_LABELS[code] ?? "Unknown";
}

export function getWeatherSummary(code) {
	if ([0, 1].includes(code)) {
		return "Bright and clear";
	}

	if ([2, 3].includes(code)) {
		return "Cloudy skies";
	}

	if ([45, 48].includes(code)) {
		return "Low visibility";
	}

	if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
		return "Wet conditions";
	}

	if ([71, 73, 75, 77, 85, 86].includes(code)) {
		return "Wintry weather";
	}

	if ([95, 96, 99].includes(code)) {
		return "Stormy conditions";
	}

	return "Mixed conditions";
}

export function getWeatherTheme(code) {
	if ([0, 1].includes(code)) return "sunny";
	if ([2, 3].includes(code)) return "cloudy";
	if ([45, 48].includes(code)) return "foggy";
	if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "rainy";
	if ([71, 73, 75, 77, 85, 86].includes(code)) return "snowy";
	if ([95, 96, 99].includes(code)) return "stormy";
	return "default";
}
