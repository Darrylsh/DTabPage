import { useState, useEffect } from 'react';
import { useWeather } from '../hooks/useWeather';

export function Clock() {
  const [now, setNow] = useState(new Date());
  const weather = useWeather();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="text-center animate-fade-in select-none">
      <div className="text-7xl font-display font-light tracking-tight text-white drop-shadow-lg">
        {timeStr}
      </div>
      <div className="mt-2 text-lg font-light text-white/70 tracking-wide flex items-center justify-center gap-3">
        <span>{dateStr}</span>
        {weather && (
          <>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-1.5">
              <span>{weather.emoji}</span>
              <span>{weather.temp}°F</span>
              <span className="text-white/50">{weather.condition}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
