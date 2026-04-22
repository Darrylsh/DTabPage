import { useState, useEffect } from 'react';
import { getWeatherInfo } from '../lib/weatherCodes';

export interface WeatherData {
  temp: number;
  condition: string;
  emoji: string;
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit`;
          const res = await fetch(url);
          const data = await res.json();
          const cw = data.current_weather;
          const info = getWeatherInfo(cw.weathercode);
          setWeather({
            temp: Math.round(cw.temperature),
            condition: info.label,
            emoji: info.emoji,
          });
        } catch (err) {
          console.warn('Weather fetch failed', err);
        }
      },
      () => {
        // Geolocation denied — silently skip
        console.warn('Geolocation denied');
      },
      { timeout: 5000 }
    );
  }, []);

  return weather;
}
