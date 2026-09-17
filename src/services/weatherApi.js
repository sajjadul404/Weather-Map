/**
 * Maps WMO weather codes to human-readable condition text, icons, and categories
 */
export function getWeatherCodeInfo(code, isDay = true) {
  switch (code) {
    case 0:
      return {
        description: isDay ? 'Clear Sky' : 'Clear Night',
        iconName: isDay ? 'Sun' : 'Moon',
        category: 'clear',
      };
    case 1:
      return {
        description: 'Mainly Clear',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
        category: 'clear',
      };
    case 2:
      return {
        description: 'Partly Cloudy',
        iconName: 'CloudSun',
        category: 'cloudy',
      };
    case 3:
      return {
        description: 'Overcast',
        iconName: 'Cloud',
        category: 'cloudy',
      };
    case 45:
    case 48:
      return {
        description: 'Foggy',
        iconName: 'CloudFog',
        category: 'fog',
      };
    case 51:
    case 53:
    case 55:
      return {
        description: 'Drizzle',
        iconName: 'CloudDrizzle',
        category: 'rain',
      };
    case 56:
    case 57:
      return {
        description: 'Freezing Drizzle',
        iconName: 'CloudSnow',
        category: 'rain',
      };
    case 61:
      return {
        description: 'Light Rain',
        iconName: 'CloudRain',
        category: 'rain',
      };
    case 63:
      return {
        description: 'Moderate Rain',
        iconName: 'CloudRain',
        category: 'rain',
      };
    case 65:
      return {
        description: 'Heavy Rain',
        iconName: 'CloudRain',
        category: 'rain',
      };
    case 66:
    case 67:
      return {
        description: 'Freezing Rain',
        iconName: 'CloudSnow',
        category: 'rain',
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        description: 'Snow',
        iconName: 'Snowflake',
        category: 'snow',
      };
    case 80:
      return {
        description: 'Light Showers',
        iconName: 'CloudRain',
        category: 'rain',
      };
    case 81:
      return {
        description: 'Rain Showers',
        iconName: 'CloudRain',
        category: 'rain',
      };
    case 82:
      return {
        description: 'Violent Showers',
        iconName: 'CloudLightning',
        category: 'rain',
      };
    case 85:
    case 86:
      return {
        description: 'Snow Showers',
        iconName: 'CloudSnow',
        category: 'snow',
      };
    case 95:
      return {
        description: 'Thunderstorm',
        iconName: 'CloudLightning',
        category: 'thunder',
      };
    case 96:
    case 99:
      return {
        description: 'Severe Thunderstorm',
        iconName: 'CloudLightning',
        category: 'thunder',
      };
    default:
      return {
        description: 'Partly Cloudy',
        iconName: 'CloudSun',
        category: 'cloudy',
      };
  }
}

/**
 * Core temperature color scale:
 * Below 10°C = Blue
 * 10–20°C = Cyan
 * 20–25°C = Green
 * 25–30°C = Yellow
 * 30–35°C = Orange
 * 35°C+ = Red
 */
export function getTemperatureColor(tempC) {
  if (tempC < 10) return '#3b82f6'; // Blue
  if (tempC < 20) return '#06b6d4'; // Cyan
  if (tempC < 25) return '#10b981'; // Green
  if (tempC < 30) return '#eab308'; // Yellow
  if (tempC < 35) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

/**
 * Returns smooth RGB components for heatmap canvas interpolation
 */
export function getInterpolatedTempRgb(tempC) {
  if (tempC <= 5) return [59, 130, 246];
  if (tempC <= 15) {
    const t = (tempC - 5) / 10;
    return [
      Math.round(59 + (6 - 59) * t),
      Math.round(130 + (182 - 130) * t),
      Math.round(246 + (212 - 246) * t),
    ];
  }
  if (tempC <= 22) {
    const t = (tempC - 15) / 7;
    return [
      Math.round(6 + (16 - 6) * t),
      Math.round(182 + (185 - 182) * t),
      Math.round(212 + (129 - 212) * t),
    ];
  }
  if (tempC <= 27) {
    const t = (tempC - 22) / 5;
    return [
      Math.round(16 + (234 - 16) * t),
      Math.round(185 + (179 - 185) * t),
      Math.round(129 + (8 - 129) * t),
    ];
  }
  if (tempC <= 33) {
    const t = (tempC - 27) / 6;
    return [
      Math.round(234 + (249 - 234) * t),
      Math.round(179 + (115 - 179) * t),
      Math.round(8 + (22 - 8) * t),
    ];
  }
  if (tempC < 38) {
    const t = (tempC - 33) / 5;
    return [
      Math.round(249 + (239 - 249) * t),
      Math.round(115 + (68 - 115) * t),
      Math.round(22 + (68 - 22) * t),
    ];
  }
  return [239, 68, 68];
}

/**
 * Fetches real weather data from Open-Meteo free API
 */
export async function fetchWeatherData(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather API returned ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  const current = data.current;
  const isDay = current.is_day === 1;
  const weatherCode = current.weather_code ?? 0;
  const codeInfo = getWeatherCodeInfo(weatherCode, isDay);

  const hourlyTime = data.hourly?.time?.slice(0, 24) ?? [];
  const hourlyTemp = data.hourly?.temperature_2m?.slice(0, 24) ?? [];
  const hourlyPrecip = data.hourly?.precipitation_probability?.slice(0, 24) ?? [];
  const hourlyCode = data.hourly?.weather_code?.slice(0, 24) ?? [];

  const dailyTime = data.daily?.time?.slice(0, 7) ?? [];
  const dailyCode = data.daily?.weather_code?.slice(0, 7) ?? [];
  const dailyTempMax = data.daily?.temperature_2m_max?.slice(0, 7) ?? [];
  const dailyTempMin = data.daily?.temperature_2m_min?.slice(0, 7) ?? [];
  const dailyPrecip = data.daily?.precipitation_sum?.slice(0, 7) ?? [];

  return {
    temperature: Math.round(current.temperature_2m * 10) / 10,
    apparentTemperature: Math.round(current.apparent_temperature * 10) / 10,
    relativeHumidity: current.relative_humidity_2m ?? 60,
    precipitation: current.precipitation ?? 0,
    weatherCode,
    windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
    windDirection: current.wind_direction_10m ?? 0,
    surfacePressure: Math.round(current.surface_pressure ?? 1013),
    condition: codeInfo.description,
    isDay,
    hourly: {
      time: hourlyTime,
      temperature: hourlyTemp,
      precipitationProbability: hourlyPrecip,
      weatherCode: hourlyCode,
    },
    daily: {
      time: dailyTime,
      weatherCode: dailyCode,
      temperatureMax: dailyTempMax,
      temperatureMin: dailyTempMin,
      precipitationSum: dailyPrecip,
    },
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Searches locations using Open-Meteo free geocoding API
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];
  const trimmed = query.trim();
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=7&language=en&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((item) => ({
      id: `geo-${item.id}`,
      name: item.name,
      lat: item.latitude,
      lng: item.longitude,
      country: item.country || '',
      admin1: item.admin1 || '',
    }));
  } catch {
    return [];
  }
}

/**
 * Reverse geocodes a clicked map coordinate
 */
export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const name =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.county ||
        addr.state ||
        data.name ||
        `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
      return {
        name,
        country: addr.country,
      };
    }
  } catch {
    // Fallback if network or rate limit
  }
  return {
    name: `Location (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
  };
}

/**
 * Default location set centered around Bangladesh and surrounding regional hubs
 */
export const DEFAULT_LOCATIONS = [
  {
    id: 'dhaka',
    name: 'Dhaka',
    lat: 23.8103,
    lng: 90.4125,
    country: 'Bangladesh',
    admin1: 'Dhaka Division',
  },
  {
    id: 'chittagong',
    name: 'Chittagong',
    lat: 22.3569,
    lng: 91.7832,
    country: 'Bangladesh',
    admin1: 'Chattogram Division',
  },
  {
    id: 'sylhet',
    name: 'Sylhet',
    lat: 24.8949,
    lng: 91.8687,
    country: 'Bangladesh',
    admin1: 'Sylhet Division',
  },
  {
    id: 'rajshahi',
    name: 'Rajshahi',
    lat: 24.3636,
    lng: 88.6241,
    country: 'Bangladesh',
    admin1: 'Rajshahi Division',
  },
  {
    id: 'khulna',
    name: 'Khulna',
    lat: 22.8456,
    lng: 89.5403,
    country: 'Bangladesh',
    admin1: 'Khulna Division',
  },
  {
    id: 'rangpur',
    name: 'Rangpur',
    lat: 25.7439,
    lng: 89.2752,
    country: 'Bangladesh',
    admin1: 'Rangpur Division',
  },
  {
    id: 'mymensingh',
    name: 'Mymensingh',
    lat: 24.7471,
    lng: 90.4203,
    country: 'Bangladesh',
    admin1: 'Mymensingh Division',
  },
  {
    id: 'barisal',
    name: 'Barisal',
    lat: 22.701,
    lng: 90.3535,
    country: 'Bangladesh',
    admin1: 'Barishal Division',
  },
  {
    id: 'coxsbazar',
    name: "Cox's Bazar",
    lat: 21.4272,
    lng: 92.0058,
    country: 'Bangladesh',
    admin1: 'Bay of Bengal Coast',
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    lat: 22.5726,
    lng: 88.3639,
    country: 'India',
    admin1: 'West Bengal',
  },
  {
    id: 'guwahati',
    name: 'Guwahati',
    lat: 26.1445,
    lng: 91.7362,
    country: 'India',
    admin1: 'Assam',
  },
  {
    id: 'yangon',
    name: 'Yangon',
    lat: 16.8661,
    lng: 96.1951,
    country: 'Myanmar',
    admin1: 'Yangon Region',
  },
];
