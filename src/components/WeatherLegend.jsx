import React from 'react';

export const WeatherLegend = ({ variable, unit }) => {
  const getLegendData = () => {
    switch (variable) {
      case 'rainfall':
        return {
          title: 'Rainfall Precipitation',
          unitLabel: 'mm/h',
          gradient:
            'linear-gradient(to right, #0284c7, #06b6d4, #10b981, #eab308, #f97316, #ef4444, #a855f7)',
          ticks: ['0 mm', '2 mm', '5 mm', '10 mm', '25+ mm'],
        };
      case 'wind':
        return {
          title: 'Wind Speed',
          unitLabel: 'km/h',
          gradient:
            'linear-gradient(to right, #38bdf8, #0ea5e9, #10b981, #eab308, #ea580c, #dc2626)',
          ticks: ['0 km/h', '15 km/h', '30 km/h', '50 km/h', '80+ km/h'],
        };
      case 'humidity':
        return {
          title: 'Relative Humidity',
          unitLabel: '%',
          gradient:
            'linear-gradient(to right, #fef08a, #86efac, #67e8f9, #38bdf8, #2563eb, #1e3a8a)',
          ticks: ['20%', '40%', '60%', '80%', '100%'],
        };
      case 'temperature':
      default:
        return {
          title: 'Temperature',
          unitLabel: unit === 'celsius' ? '°C' : '°F',
          gradient:
            'linear-gradient(to right, #3b82f6 0%, #06b6d4 25%, #10b981 40%, #eab308 65%, #f97316 85%, #ef4444 100%)',
          ticks:
            unit === 'celsius'
              ? ['< 10°C', '20°C', '25°C', '30°C', '35°C+']
              : ['< 50°F', '68°F', '77°F', '86°F', '95°F+'],
        };
    }
  };

  const data = getLegendData();

  return (
    <div
      id="weather-legend-card"
      className="fixed bottom-6 right-4 sm:right-6 z-20 w-72 sm:w-80 p-3.5 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 shadow-2xl shadow-black/40 text-slate-100 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          {data.title}
        </span>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
          Scale ({data.unitLabel})
        </span>
      </div>

      {/* Horizontal Gradient Bar */}
      <div
        className="w-full h-3 rounded-full shadow-inner border border-white/10"
        style={{ background: data.gradient }}
      />

      {/* Ticks and Labels */}
      <div className="flex justify-between text-[10px] font-medium text-slate-300 mt-1.5 px-0.5">
        {data.ticks.map((tick, idx) => (
          <span key={idx} className="tracking-tight">
            {tick}
          </span>
        ))}
      </div>
    </div>
  );
};
