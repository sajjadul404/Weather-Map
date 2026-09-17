import React, { useState, useEffect, useRef } from 'react';
import {
  CloudRain,
  Search,
  MapPin,
  X,
  Loader2,
  SlidersHorizontal,
  Navigation,
} from 'lucide-react';
import { searchLocations } from '../services/weatherApi.js';

export const Header = ({
  onSelectLocation,
  onUseCurrentLocation,
  isLocatingUser,
  tempUnit,
  onToggleTempUnit,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
        setIsDropdownOpen(true);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (item) => {
    onSelectLocation(item);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  return (
    <header
      id="app-header"
      className="fixed top-0 left-0 right-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-lg shadow-black/20"
    >
      {/* Left: WeatherMap Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          aria-label="Toggle control sidebar"
          className={`p-2 rounded-xl border transition-all duration-200 ${
            isSidebarOpen
              ? 'bg-blue-600/30 text-blue-400 border-blue-500/50 shadow-sm shadow-blue-500/20'
              : 'bg-slate-900/80 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
          }`}
          title="Toggle Controls Panel"
        >
          <SlidersHorizontal size={18} />
        </button>

        <div className="flex items-center gap-2.5 cursor-pointer select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-sky-400 flex items-center justify-center shadow-md shadow-blue-600/30 text-white">
            <CloudRain size={20} className="stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
              WeatherMap
              <span className="inline-block text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Live
              </span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline leading-tight mt-0.5">
              Interactive Radar & Heatmap
            </span>
          </div>
        </div>
      </div>

      {/* Center: Large Search Bar */}
      <div
        ref={searchContainerRef}
        className="relative flex-1 max-w-xl mx-2 sm:mx-4"
      >
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            {isSearching ? (
              <Loader2 size={18} className="animate-spin text-blue-400" />
            ) : (
              <Search size={18} />
            )}
          </div>
          <input
            id="location-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setIsDropdownOpen(true);
            }}
            placeholder="Search a location (e.g. Dhaka, Chittagong, Sylhet...)"
            className="w-full h-10 pl-10 pr-9 bg-slate-900/90 hover:bg-slate-900 focus:bg-slate-900/95 text-slate-100 placeholder-slate-400 text-sm rounded-xl border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-150 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-3 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isDropdownOpen && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800">
            {searchResults.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectResult(item)}
                className="w-full px-4 py-3 text-left hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin size={16} className="text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-sm font-medium text-slate-100 group-hover:text-blue-300">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {[item.admin1, item.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {item.lat.toFixed(2)}°, {item.lng.toFixed(2)}°
                </span>
              </button>
            ))}
          </div>
        )}

        {isDropdownOpen && searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-xl p-4 text-center text-sm text-slate-400 shadow-2xl z-50">
            No locations found for &ldquo;{searchQuery}&rdquo;. Try another city name.
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Temperature Unit Toggle */}
        <button
          id="btn-unit-toggle"
          onClick={onToggleTempUnit}
          aria-label="Toggle temperature unit"
          className="hidden md:flex items-center h-9 px-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Switch °C / °F"
        >
          <span className={tempUnit === 'celsius' ? 'text-blue-400 font-bold' : 'text-slate-400'}>
            °C
          </span>
          <span className="mx-1 text-slate-600">/</span>
          <span className={tempUnit === 'fahrenheit' ? 'text-blue-400 font-bold' : 'text-slate-400'}>
            °F
          </span>
        </button>

        {/* Current Location Button */}
        <button
          id="btn-current-location"
          onClick={onUseCurrentLocation}
          disabled={isLocatingUser}
          className="h-10 px-3 sm:px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          title="Find current location using GPS"
        >
          {isLocatingUser ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Navigation size={16} className="text-white" />
          )}
          <span className="hidden sm:inline">Current Location</span>
        </button>
      </div>
    </header>
  );
};
