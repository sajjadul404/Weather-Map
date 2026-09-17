import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  getTemperatureColor,
  getInterpolatedTempRgb,
  getWeatherCodeInfo,
} from '../services/weatherApi.js';
import { Plus, Minus, Compass } from 'lucide-react';

export const MapView = ({
  locations,
  selectedLocation,
  onSelectLocation,
  onMapClickCoordinate,
  mapStyle,
  showHeatmap,
  heatmapOpacity,
  selectedVariable,
  selectedLayer,
  tempUnit,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [, setCurrentZoom] = useState(7);

  // Helper to format temperature
  const formatTemp = useCallback(
    (tempC) => {
      if (tempC === undefined) return '--';
      if (tempUnit === 'fahrenheit') {
        const f = (tempC * 9) / 5 + 32;
        return `${Math.round(f)}°F`;
      }
      return `${Math.round(tempC)}°`;
    },
    [tempUnit]
  );

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Bangladesh (23.8103, 90.4125) with initial view
    const map = L.map(mapContainerRef.current, {
      center: [23.8103, 90.4125],
      zoom: 7,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
    });

    L.control
      .attribution({
        position: 'bottomright',
        prefix:
          '<a href="https://leafletjs.com" class="text-slate-400 hover:text-slate-200">Leaflet</a> | <a href="https://open-meteo.com" class="text-slate-400 hover:text-slate-200">Open-Meteo</a>',
      })
      .addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Track zoom
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    // Handle map click
    map.on('click', (e) => {
      onMapClickCoordinate(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onMapClickCoordinate]);

  // 2. Handle Tile Layer Switch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let subdomains = 'abc';
    let maxZoom = 19;

    if (mapStyle === 'satellite') {
      url =
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 18;
    } else if (mapStyle === 'terrain') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      maxZoom = 17;
    } else if (mapStyle === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      subdomains = 'abcd';
      maxZoom = 20;
    }

    tileLayerRef.current = L.tileLayer(url, {
      subdomains,
      maxZoom,
      opacity: 0.95,
    }).addTo(map);
  }, [mapStyle]);

  // 3. Render Custom Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    locations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const weather = loc.weather;
      const temp = weather?.temperature;
      const tempColor = temp !== undefined ? getTemperatureColor(temp) : '#3b82f6';
      const cond = weather?.condition || 'Updating...';
      const codeInfo = weather
        ? getWeatherCodeInfo(weather.weatherCode, weather.isDay)
        : { iconName: 'CloudSun' };

      const getIconSvg = (name) => {
        if (name === 'Sun') {
          return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
        }
        if (name.includes('Rain') || name.includes('Drizzle')) {
          return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`;
        }
        if (name.includes('Lightning')) {
          return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></svg>`;
        }
        return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`;
      };

      const html = `
        <div class="group relative cursor-pointer transform -translate-x-1/2 -translate-y-full transition-all duration-200 ${
          isSelected ? 'scale-110 z-50' : 'hover:scale-105 z-20'
        }">
          <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl backdrop-blur-xl border shadow-xl ${
            isSelected
              ? 'bg-slate-950/95 border-blue-400 ring-2 ring-blue-500/50 shadow-blue-500/20'
              : 'bg-slate-950/85 border-slate-700/80 hover:border-slate-500 shadow-black/40'
          }">
            <div class="shrink-0 flex items-center justify-center">
              ${getIconSvg(codeInfo.iconName)}
            </div>
            
            <div class="flex flex-col min-w-0 pr-1">
              <span class="text-[11px] font-bold text-white leading-tight truncate max-w-[80px]">
                ${loc.name}
              </span>
              <span class="text-[9px] text-slate-400 leading-none truncate max-w-[80px]">
                ${cond}
              </span>
            </div>

            <div class="px-1.5 py-0.5 rounded-lg text-[11px] font-black text-white shadow-sm shrink-0 leading-tight" style="background-color: ${tempColor};">
              ${formatTemp(temp)}
            </div>
          </div>

          <!-- Pointer Pin Tip -->
          <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ${
            isSelected ? 'border-t-blue-400' : 'border-t-slate-800'
          } mx-auto -mt-[1px]"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html,
        className: 'custom-weather-marker-container',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });
      marker.on('click', () => {
        onSelectLocation(loc);
      });

      markersLayer.addLayer(marker);
    });
  }, [locations, selectedLocation, onSelectLocation, formatTemp]);

  // 4. Fly to selected location
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedLocation) return;

    map.flyTo([selectedLocation.lat, selectedLocation.lng], Math.max(map.getZoom(), 8), {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [selectedLocation]);

  // 5. Canvas Heatmap / Weather Overlay Generation
  useEffect(() => {
    const map = mapInstanceRef.current;
    const canvas = canvasRef.current;
    if (!map || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    let particleOffset = 0;

    const renderOverlay = () => {
      if (!isRunning) return;

      const size = map.getSize();
      if (canvas.width !== size.x || canvas.height !== size.y) {
        canvas.width = size.x;
        canvas.height = size.y;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!showHeatmap) {
        return;
      }

      // Collect active location points with data
      const points = locations
        .filter((l) => l.weather !== undefined)
        .map((l) => {
          const pt = map.latLngToContainerPoint([l.lat, l.lng]);
          return {
            x: pt.x,
            y: pt.y,
            temp: l.weather.temperature,
            rain: l.weather.precipitation,
            wind: l.weather.windSpeed,
            windDir: l.weather.windDirection,
            humidity: l.weather.relativeHumidity,
          };
        });

      if (points.length === 0) return;

      // 5A. Render based on selected layer / variable
      if (selectedLayer === 'heatmap' || selectedVariable === 'temperature') {
        const step = Math.max(12, Math.floor(20 - map.getZoom()));
        const radius = Math.max(180, 260 * (map.getZoom() / 7));
        const radiusSq = radius * radius;

        const cols = Math.ceil(canvas.width / step);
        const rows = Math.ceil(canvas.height / step);

        for (let i = 0; i < cols; i++) {
          const px = i * step;
          for (let j = 0; j < rows; j++) {
            const py = j * step;

            let totalWeight = 0;
            let weightedTemp = 0;
            let minDistance = Infinity;

            for (const pt of points) {
              const dx = px - pt.x;
              const dy = py - pt.y;
              const distSq = dx * dx + dy * dy;

              if (distSq < radiusSq) {
                const dist = Math.sqrt(distSq);
                if (dist < minDistance) minDistance = dist;
                const weight = 1 / Math.pow(Math.max(dist, 10), 1.8);
                weightedTemp += pt.temp * weight;
                totalWeight += weight;
              }
            }

            if (totalWeight > 0 && minDistance < radius) {
              const interpolatedTemp = weightedTemp / totalWeight;
              const [r, g, b] = getInterpolatedTempRgb(interpolatedTemp);
              const edgeAlpha = Math.max(0, 1 - minDistance / radius);
              const alpha = edgeAlpha * heatmapOpacity * 0.75;

              ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
              ctx.fillRect(px - step * 0.5, py - step * 0.5, step + 1, step + 1);
            }
          }
        }
      } else if (selectedLayer === 'rainfall' || selectedVariable === 'rainfall') {
        points.forEach((pt) => {
          const intensity = Math.min(1, (pt.rain || 0.5) / 10);
          const rad = 70 + intensity * 60;
          const grad = ctx.createRadialGradient(pt.x, pt.y, 5, pt.x, pt.y, rad);
          grad.addColorStop(0, `rgba(56, 189, 248, ${0.7 * heatmapOpacity})`);
          grad.addColorStop(0.5, `rgba(14, 165, 233, ${0.4 * heatmapOpacity})`);
          grad.addColorStop(1, 'rgba(14, 165, 233, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
          ctx.fill();

          const ringRad = ((particleOffset * 2) % rad) + 10;
          ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, (1 - ringRad / rad) * 0.5 * heatmapOpacity)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, ringRad, 0, Math.PI * 2);
          ctx.stroke();
        });
      } else if (selectedLayer === 'wind' || selectedVariable === 'wind') {
        particleOffset = (particleOffset + 0.8) % 100;
        ctx.lineWidth = 2;

        points.forEach((pt) => {
          const speed = Math.max(5, pt.wind);
          const rad = (pt.windDir * Math.PI) / 180;
          const u = Math.sin(rad);
          const v = -Math.cos(rad);

          const count = 6;
          for (let k = 0; k < count; k++) {
            const angleOffset = (k * Math.PI * 2) / count;
            const dist = 30 + k * 15;
            const ox = pt.x + Math.cos(angleOffset) * dist;
            const oy = pt.y + Math.sin(angleOffset) * dist;

            const t = (particleOffset + k * 20) % 60;
            const len = speed * 1.5;
            const startX = ox + u * t;
            const startY = oy + v * t;

            ctx.strokeStyle = `rgba(45, 212, 191, ${0.65 * heatmapOpacity})`;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(startX + u * len, startY + v * len);
            ctx.stroke();

            ctx.fillStyle = `rgba(204, 251, 241, ${0.8 * heatmapOpacity})`;
            ctx.beginPath();
            ctx.arc(startX + u * len, startY + v * len, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      } else if (selectedLayer === 'clouds') {
        points.forEach((pt) => {
          const rad = 120;
          const grad = ctx.createRadialGradient(pt.x, pt.y, 10, pt.x, pt.y, rad);
          grad.addColorStop(0, `rgba(226, 232, 240, ${0.55 * heatmapOpacity})`);
          grad.addColorStop(0.7, `rgba(203, 213, 225, ${0.25 * heatmapOpacity})`);
          grad.addColorStop(1, 'rgba(203, 213, 225, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (selectedLayer === 'wind' || selectedLayer === 'rainfall') {
        animationFrameRef.current = requestAnimationFrame(renderOverlay);
      }
    };

    const onMapMove = () => {
      renderOverlay();
    };

    map.on('move', onMapMove);
    map.on('zoom', onMapMove);
    map.on('resize', onMapMove);

    renderOverlay();

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      map.off('move', onMapMove);
      map.off('zoom', onMapMove);
      map.off('resize', onMapMove);
    };
  }, [locations, showHeatmap, heatmapOpacity, selectedLayer, selectedVariable]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    mapInstanceRef.current?.flyTo([23.8103, 90.4125], 7, { duration: 1 });
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950">
      {/* 1. Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 outline-none" />

      {/* 2. Interactive Canvas Overlay for Heatmap and Radars */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* 3. Floating Map Controls (Zoom, Reset View, Info) */}
      <div className="absolute right-4 sm:right-6 top-20 z-20 flex flex-col gap-2">
        <div className="flex flex-col rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 shadow-2xl shadow-black/40 overflow-hidden divide-y divide-slate-800">
          <button
            id="btn-zoom-in"
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800/80 active:bg-slate-700 transition-colors"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <Plus size={18} />
          </button>
          <button
            id="btn-zoom-out"
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800/80 active:bg-slate-700 transition-colors"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <Minus size={18} />
          </button>
        </div>

        {/* Center / Reset to Bangladesh & Region */}
        <button
          id="btn-reset-view"
          onClick={handleResetView}
          className="w-10 h-10 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 shadow-2xl shadow-black/40 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-700 transition-colors"
          title="Reset to Regional Overview"
          aria-label="Reset map position"
        >
          <Compass size={18} className="text-blue-400" />
        </button>
      </div>
    </div>
  );
};
