import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.jsx';
import { MapView } from './components/MapView.jsx';
import { WeatherSidebar } from './components/WeatherSidebar.jsx';
import { WeatherPopup } from './components/WeatherPopup.jsx';
import { WeatherLegend } from './components/WeatherLegend.jsx';
import { LiveStatus } from './components/LiveStatus.jsx';
import { Notification } from './components/Notification.jsx';
import {
  DEFAULT_LOCATIONS,
  fetchWeatherData,
  reverseGeocode,
} from './services/weatherApi.js';

export default function App() {
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedVariable, setSelectedVariable] = useState('temperature');
  const [selectedLayer, setSelectedLayer] = useState('heatmap');
  const [mapStyle, setMapStyle] = useState('default');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.65);
  const [tempUnit, setTempUnit] = useState('celsius');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [toasts, setToasts] = useState([]);

  // Add toast helper
  const addToast = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch weather data for a single location
  const loadLocationWeather = useCallback(async (loc) => {
    try {
      const weather = await fetchWeatherData(loc.lat, loc.lng);
      return { ...loc, weather, isLoading: false, error: undefined };
    } catch {
      return {
        ...loc,
        isLoading: false,
        error: 'Unable to fetch weather data. Please try again.',
      };
    }
  }, []);

  // Fetch all initial locations
  const refreshAllWeatherData = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const results = await Promise.allSettled(
        locations.map(async (loc) => {
          const weather = await fetchWeatherData(loc.lat, loc.lng);
          return { ...loc, weather, isLoading: false, error: undefined };
        })
      );

      let hasSuccess = false;
      let hasError = false;

      const updated = locations.map((loc, idx) => {
        const res = results[idx];
        if (res.status === 'fulfilled') {
          hasSuccess = true;
          return res.value;
        } else {
          hasError = true;
          return { ...loc, isLoading: false };
        }
      });

      setLocations(updated);

      if (hasSuccess) {
        setLastUpdated('just now');
      }

      if (hasError && !hasSuccess) {
        addToast('error', 'Unable to fetch weather data. Please try again.');
      }
    } catch {
      addToast('error', 'Unable to fetch weather data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  }, [locations, addToast]);

  // Initial load
  useEffect(() => {
    refreshAllWeatherData();
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep selected location synced with updated weather
  useEffect(() => {
    if (selectedLocation) {
      const current = locations.find((l) => l.id === selectedLocation.id);
      if (current && current.weather && !selectedLocation.weather) {
        setSelectedLocation(current);
      }
    }
  }, [locations, selectedLocation]);

  // Handle selecting a location (marker click, search result, or sidebar item)
  const handleSelectLocation = useCallback(
    async (loc) => {
      setSelectedLocation(loc);

      if (!loc.weather && !loc.isLoading) {
        setLocations((prev) =>
          prev.map((item) => (item.id === loc.id ? { ...item, isLoading: true } : item))
        );

        const updated = await loadLocationWeather(loc);
        setLocations((prev) => {
          const exists = prev.some((l) => l.id === updated.id);
          if (exists) {
            return prev.map((l) => (l.id === updated.id ? updated : l));
          }
          return [updated, ...prev];
        });
        setSelectedLocation(updated);
      } else {
        setLocations((prev) => {
          if (!prev.some((l) => l.id === loc.id)) {
            return [loc, ...prev];
          }
          return prev;
        });
      }
    },
    [loadLocationWeather]
  );

  // Handle map click anywhere (inspect coordinate)
  const handleMapClickCoordinate = useCallback(
    async (lat, lng) => {
      const tempId = `click-${lat.toFixed(3)}-${lng.toFixed(3)}`;

      const newLoc = {
        id: tempId,
        name: `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
        lat,
        lng,
        isLoading: true,
      };

      setSelectedLocation(newLoc);
      setLocations((prev) => [newLoc, ...prev.filter((l) => !l.id.startsWith('click-'))]);

      try {
        const [geo, weather] = await Promise.all([
          reverseGeocode(lat, lng),
          fetchWeatherData(lat, lng),
        ]);

        const finalizedLoc = {
          id: tempId,
          name: geo.name,
          country: geo.country,
          lat,
          lng,
          weather,
          isLoading: false,
        };

        setLocations((prev) =>
          prev.map((item) => (item.id === tempId ? finalizedLoc : item))
        );
        setSelectedLocation(finalizedLoc);
      } catch {
        addToast('error', 'Unable to fetch weather for selected point. Please try again.');
        setLocations((prev) => prev.filter((item) => item.id !== tempId));
        setSelectedLocation(null);
      }
    },
    [addToast]
  );

  // Handle "Current Location" GPS button
  const handleUseCurrentLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      addToast('error', 'Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingUser(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const myLocationId = 'my-location';

        const myLoc = {
          id: myLocationId,
          name: 'My Current Location',
          lat,
          lng,
          isLoading: true,
          isUserLocation: true,
        };

        setSelectedLocation(myLoc);
        setLocations((prev) => [myLoc, ...prev.filter((l) => l.id !== myLocationId)]);

        try {
          const [geo, weather] = await Promise.all([
            reverseGeocode(lat, lng),
            fetchWeatherData(lat, lng),
          ]);

          const finalizedLoc = {
            id: myLocationId,
            name: geo.name || 'My Current Location',
            country: geo.country,
            lat,
            lng,
            weather,
            isLoading: false,
            isUserLocation: true,
          };

          setLocations((prev) =>
            prev.map((item) => (item.id === myLocationId ? finalizedLoc : item))
          );
          setSelectedLocation(finalizedLoc);
          addToast('success', `Located: ${finalizedLoc.name}`);
        } catch {
          addToast('error', 'Unable to fetch weather data for current location.');
        } finally {
          setIsLocatingUser(false);
        }
      },
      (err) => {
        setIsLocatingUser(false);
        console.warn('Geolocation error:', err.message);
        addToast(
          'error',
          'Unable to retrieve current location. Please allow location permissions or search manually.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [addToast]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 flex flex-col">
      {/* 1. Fixed Header */}
      <Header
        onSelectLocation={handleSelectLocation}
        onUseCurrentLocation={handleUseCurrentLocation}
        isLocatingUser={isLocatingUser}
        tempUnit={tempUnit}
        onToggleTempUnit={() =>
          setTempUnit((prev) => (prev === 'celsius' ? 'fahrenheit' : 'celsius'))
        }
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* 2. Main Interactive Map Area */}
      <main className="relative flex-1 w-full h-[calc(100vh-4rem)] mt-16 overflow-hidden">
        <MapView
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
          onMapClickCoordinate={handleMapClickCoordinate}
          mapStyle={mapStyle}
          showHeatmap={showHeatmap}
          heatmapOpacity={heatmapOpacity}
          selectedVariable={selectedVariable}
          selectedLayer={selectedLayer}
          tempUnit={tempUnit}
        />

        {/* 3. Floating Left Sidebar Controls */}
        <WeatherSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          selectedVariable={selectedVariable}
          onChangeVariable={setSelectedVariable}
          selectedLayer={selectedLayer}
          onChangeLayer={setSelectedLayer}
          mapStyle={mapStyle}
          onChangeMapStyle={setMapStyle}
          showHeatmap={showHeatmap}
          onToggleHeatmap={setShowHeatmap}
          heatmapOpacity={heatmapOpacity}
          onChangeHeatmapOpacity={setHeatmapOpacity}
          locations={locations}
          selectedLocationId={selectedLocation?.id ?? null}
          onSelectLocation={handleSelectLocation}
          tempUnit={tempUnit}
        />

        {/* 4. Selected Weather Information Popup / Card */}
        {selectedLocation && (
          <WeatherPopup
            location={selectedLocation}
            onClose={() => setSelectedLocation(null)}
            tempUnit={tempUnit}
          />
        )}

        {/* 5. Bottom Left Live Status Card */}
        <LiveStatus
          isRefreshing={isRefreshing}
          onRefresh={refreshAllWeatherData}
          lastUpdated={lastUpdated}
        />

        {/* 6. Bottom Right Weather Legend */}
        <WeatherLegend variable={selectedVariable} unit={tempUnit} />

        {/* 7. Toast Notifications */}
        <Notification toasts={toasts} onDismiss={dismissToast} />
      </main>
    </div>
  );
}
