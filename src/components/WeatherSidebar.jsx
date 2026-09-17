import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Thermometer,
  Layers,
  Map,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Navigation,
  Globe,
} from 'lucide-react';
import { getTemperatureColor } from '../services/weatherApi.js';

export const WeatherSidebar = ({
  isOpen,
  onClose,
  selectedVariable,
  onChangeVariable,
  selectedLayer,
  onChangeLayer,
  mapStyle,
  onChangeMapStyle,
  showHeatmap,
  onToggleHeatmap,
  heatmapOpacity,
  onChangeHeatmapOpacity,
  locations,
  selectedLocationId,
  onSelectLocation,
  tempUnit,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTemp = (tempC) => {
    if (tempUnit === 'fahrenheit') {
      const f = (tempC * 9) / 5 + 32;
      return `${Math.round(f)}°F`;
    }
    return `${Math.round(tempC)}°C`;
  };

  const formattedTime = currentDateTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = currentDateTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (!isOpen) {
    return (
      <button
        id="btn-expand-sidebar"
        onClick={onClose}
        className="fixed top-20 left-4 z-20 p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-xl backdrop-blur-md transition-all duration-200 flex items-center gap-2 group"
        title="Open Weather Controls"
      >
        <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform text-blue-400" />
        <span className="text-xs font-semibold pr-1">Controls</span>
      </button>
    );
  }

  return (
    <aside
      id="weather-sidebar"
      className="fixed top-20 left-4 z-20 w-80 sm:w-88 max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 shadow-2xl shadow-black/40 text-slate-100 flex flex-col transition-all duration-300 scrollbar-thin scrollbar-thumb-slate-700"
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-start justify-between gap-2 sticky top-0 bg-slate-950/95 backdrop-blur-md z-10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">Weather Map</h2>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Control Panel
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Explore real-time weather conditions across different locations
          </p>
        </div>
        <button
          id="btn-collapse-sidebar"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0"
          title="Collapse Panel"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* 1. Date & Time */}
        <section className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-blue-400" />
              Date &amp; Time
            </span>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">{formattedDate}</div>
              <div className="text-sm font-bold font-mono text-white tracking-wide">
                {formattedTime}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
              <Calendar size={14} className="text-slate-400 shrink-0" />
              <input
                id="input-date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-800/70 border border-slate-700/60 rounded-lg text-xs text-slate-200 px-2 py-1 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* 2. Weather Variable */}
        <section className="space-y-2">
          <label
            htmlFor="select-weather-variable"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider"
          >
            <Thermometer size={14} className="text-amber-400" />
            Weather Variable
          </label>
          <div className="relative">
            <select
              id="select-weather-variable"
              value={selectedVariable}
              onChange={(e) => onChangeVariable(e.target.value)}
              className="w-full h-10 px-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-medium text-slate-100 appearance-none focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
            >
              <option value="temperature">Temperature (°C / °F)</option>
              <option value="rainfall">Rainfall (mm / intensity)</option>
              <option value="wind">Wind Speed (km/h)</option>
              <option value="humidity">Humidity (%)</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </section>

        {/* 3. Layer */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="select-weather-layer"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              <Layers size={14} className="text-cyan-400" />
              Layer Overlay
            </label>
            <button
              id="btn-toggle-heatmap-visibility"
              onClick={() => onToggleHeatmap(!showHeatmap)}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showHeatmap ? (
                <>
                  <Eye size={13} className="text-emerald-400" />
                  <span>Visible</span>
                </>
              ) : (
                <>
                  <EyeOff size={13} className="text-rose-400" />
                  <span>Hidden</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <select
              id="select-weather-layer"
              value={selectedLayer}
              onChange={(e) => onChangeLayer(e.target.value)}
              className="w-full h-10 px-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-medium text-slate-100 appearance-none focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
            >
              <option value="heatmap">Temperature Heatmap</option>
              <option value="rainfall">Rainfall Precipitation</option>
              <option value="wind">Wind Streamlines</option>
              <option value="clouds">Cloud Cover</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Heatmap Opacity Slider */}
          {showHeatmap && (
            <div className="pt-2 px-1">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Overlay Opacity</span>
                <span className="font-mono text-slate-300">{Math.round(heatmapOpacity * 100)}%</span>
              </div>
              <input
                id="input-heatmap-opacity"
                type="range"
                min="0.2"
                max="0.9"
                step="0.05"
                value={heatmapOpacity}
                onChange={(e) => onChangeHeatmapOpacity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          )}
        </section>

        {/* 4. Map Style */}
        <section className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Map size={14} className="text-emerald-400" />
            Map Style
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'default', label: 'Default', desc: 'OSM Standard' },
              { id: 'satellite', label: 'Satellite', desc: 'ESRI Aerial' },
              { id: 'terrain', label: 'Terrain', desc: 'Topographic' },
            ].map((style) => {
              const active = mapStyle === style.id;
              return (
                <button
                  key={style.id}
                  id={`btn-map-style-${style.id}`}
                  onClick={() => onChangeMapStyle(style.id)}
                  className={`p-2 rounded-xl text-left border transition-all duration-150 relative overflow-hidden ${
                    active
                      ? 'bg-blue-600/25 border-blue-500/80 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold leading-none mb-1">{style.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{style.desc}</div>
                  {active && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute top-2 right-2" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. Key Locations List */}
        <section className="space-y-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Globe size={14} className="text-blue-400" />
              Regional Weather
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              {locations.length} Locations
            </span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {locations.map((loc) => {
              const isSelected = selectedLocationId === loc.id;
              const temp = loc.weather?.temperature;
              const color = temp !== undefined ? getTemperatureColor(temp) : '#64748b';

              return (
                <button
                  key={loc.id}
                  id={`btn-location-card-${loc.id}`}
                  onClick={() => onSelectLocation(loc)}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all duration-150 text-left ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500/70 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Navigation size={13} className="text-blue-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-200 truncate">
                        {loc.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {loc.weather?.condition || loc.admin1 || 'Fetching...'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {loc.isLoading ? (
                      <span className="text-[11px] text-slate-500">...</span>
                    ) : temp !== undefined ? (
                      <div
                        className="px-2 py-0.5 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-1"
                        style={{ backgroundColor: color }}
                      >
                        {formatTemp(temp)}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500">--</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </aside>
  );
};
