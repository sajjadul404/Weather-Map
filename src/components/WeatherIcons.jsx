import React from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Snowflake,
} from 'lucide-react';

export const WeatherIcon = ({ name, size = 24, className = '' }) => {
  switch (name) {
    case 'Sun':
      return <Sun size={size} className={`text-amber-400 ${className}`} />;
    case 'Moon':
      return <Moon size={size} className={`text-indigo-200 ${className}`} />;
    case 'Cloud':
      return <Cloud size={size} className={`text-slate-300 ${className}`} />;
    case 'CloudSun':
      return <CloudSun size={size} className={`text-amber-300 ${className}`} />;
    case 'CloudMoon':
      return <CloudMoon size={size} className={`text-indigo-300 ${className}`} />;
    case 'CloudRain':
      return <CloudRain size={size} className={`text-sky-400 ${className}`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle size={size} className={`text-cyan-400 ${className}`} />;
    case 'CloudSnow':
      return <CloudSnow size={size} className={`text-sky-200 ${className}`} />;
    case 'CloudLightning':
      return <CloudLightning size={size} className={`text-amber-400 ${className}`} />;
    case 'CloudFog':
      return <CloudFog size={size} className={`text-slate-400 ${className}`} />;
    case 'Snowflake':
      return <Snowflake size={size} className={`text-blue-200 ${className}`} />;
    default:
      return <CloudSun size={size} className={`text-amber-300 ${className}`} />;
  }
};
