import React from 'react';
import {
  X,
  Droplets,
  Wind,
  Gauge,
  CloudRain,
  Calendar,
  Navigation,
} from 'lucide-react';
import { WeatherIcon } from './WeatherIcons.jsx';
import { getWeatherCodeInfo, getTemperatureColor } from '../services/weatherApi.js';

export const WeatherPopup = ({ location, onClose, tempUnit }) => {
  if (!location) return null;

  const weather = location.weather;

  const formatTemp = (tempC) => {
    if (tempC === undefined) return '--';
    if (tempUnit === 'fahrenheit') {
      const f = (tempC * 9) / 5 + 32;
      return `${Math.round(f)}°F`;
    }
    return `${Math.round(tempC)}°C`;
  };

  const getWindDirectionCardinal = (deg) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  };

  return (
    <div
      id="weather-details-card"
      className="fixed inset-x-4 bottom-4 md:inset-x-auto md:right-6 md:top-20 md:bottom-auto z-40 w-auto md:w-96 max-h-[85vh] overflow-y-auto rounded-2xl bg-slate-950/90 backdrop-blur-2xl border border-slate-700/80 shadow-2xl shadow-black/60 text-slate-100 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-right-4 scrollbar-thin scrollbar-thumb-slate-700"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-start justify-between gap-3 sticky top-0 bg-slate-950/95 backdrop-blur-md z-10">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold mb-0.5">
            <Navigation size={13} />
            <span className="truncate">
              {[location.admin1, location.country].filter(Boolean).join(', ') || 'Regional Station'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight truncate">
            {location.name}
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {location.lat.toFixed(3)}°N, {location.lng.toFixed(3)}°E
          </span>
        </div>

        <button
          id="btn-close-weather-popup"
          onClick={onClose}
          className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors shrink-0"
          aria-label="Close details"
        >
          <X size={18} />
        </button>
      </div>

      {weather ? (
        <div className="p-4 space-y-4">
          {/* Main Temp & Condition Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-800 flex items-center justify-between shadow-inner">
            <div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-4xl sm:text-5xl font-extrabold tracking-tighter"
                  style={{ color: getTemperatureColor(weather.temperature) }}
                >
                  {formatTemp(weather.temperature)}
                </span>
              </div>
              <div className="text-sm font-medium text-slate-200 mt-1">
                {weather.condition}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Feels like {formatTemp(weather.apparentTemperature)}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <WeatherIcon
                name={getWeatherCodeInfo(weather.weatherCode, weather.isDay).iconName}
                size={44}
              />
              <span className="text-[10px] text-slate-400 mt-1 font-mono">
                {weather.isDay ? 'Daytime' : 'Night'}
              </span>
            </div>
          </div>

          {/* 4-stat Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Droplets size={16} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Humidity</div>
                <div className="text-sm font-bold text-white">{weather.relativeHumidity}%</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <Wind size={16} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Wind</div>
                <div className="text-sm font-bold text-white">
                  {weather.windSpeed} km/h
                  <span className="text-[10px] text-slate-400 font-normal ml-1">
                    {getWindDirectionCardinal(weather.windDirection)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <CloudRain size={16} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Rainfall</div>
                <div className="text-sm font-bold text-white">
                  {weather.precipitation} mm
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Gauge size={16} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Pressure</div>
                <div className="text-sm font-bold text-white">{weather.surfacePressure} hPa</div>
              </div>
            </div>
          </div>

          {/* 24-Hour Forecast Timeline Strip */}
          {weather.hourly.time.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Hourly Forecast (24h)</span>
                <span className="text-[10px] text-slate-400 lowercase">precipitation prob %</span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                {weather.hourly.time.slice(0, 16).map((timeStr, idx) => {
                  const hour = new Date(timeStr).toLocaleTimeString([], { hour: 'numeric' });
                  const temp = weather.hourly.temperature[idx];
                  const code = weather.hourly.weatherCode[idx];
                  const precipProb = weather.hourly.precipitationProbability[idx] ?? 0;
                  const iconInfo = getWeatherCodeInfo(code, true);

                  return (
                    <div
                      key={timeStr}
                      className="shrink-0 w-16 p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center gap-1 text-center"
                    >
                      <span className="text-[11px] text-slate-400">{hour}</span>
                      <WeatherIcon name={iconInfo.iconName} size={20} />
                      <span className="text-xs font-bold text-white">{formatTemp(temp)}</span>
                      {precipProb > 0 ? (
                        <span className="text-[10px] text-cyan-400 font-semibold">
                          {precipProb}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600">0%</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7-Day Extended Forecast */}
          {weather.daily.time.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={13} className="text-blue-400" />
                <span>7-Day Outlook</span>
              </div>

              <div className="space-y-1.5">
                {weather.daily.time.map((dayStr, idx) => {
                  const date = new Date(dayStr);
                  const dayName = idx === 0 ? 'Today' : date.toLocaleDateString([], { weekday: 'short' });
                  const maxTemp = weather.daily.temperatureMax[idx];
                  const minTemp = weather.daily.temperatureMin[idx];
                  const code = weather.daily.weatherCode[idx];
                  const iconInfo = getWeatherCodeInfo(code, true);

                  return (
                    <div
                      key={dayStr}
                      className="p-2 rounded-xl bg-slate-900/50 border border-slate-800/70 flex items-center justify-between text-xs"
                    >
                      <span className="w-14 font-medium text-slate-300">{dayName}</span>
                      <div className="flex items-center gap-1.5">
                        <WeatherIcon name={iconInfo.iconName} size={16} />
                        <span className="text-slate-400 truncate text-[11px] max-w-[90px]">
                          {iconInfo.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-400 text-[11px]">{formatTemp(minTemp)}</span>
                        <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-amber-400"
                            style={{ width: '80%', marginLeft: '10%' }}
                          />
                        </div>
                        <span className="font-bold text-white text-[11px]">{formatTemp(maxTemp)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Fetching meteorological data for {location.name}...</span>
        </div>
      )}
    </div>
  );
};
