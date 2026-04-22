/** WMO Weather Interpretation Codes → human-readable condition + emoji */
export const WMO_CODES: Record<number, { label: string; emoji: string }> = {
  0:  { label: 'Clear',          emoji: '☀️' },
  1:  { label: 'Mostly Clear',   emoji: '🌤️' },
  2:  { label: 'Partly Cloudy',  emoji: '⛅' },
  3:  { label: 'Overcast',       emoji: '☁️' },
  45: { label: 'Foggy',          emoji: '🌫️' },
  48: { label: 'Icy Fog',        emoji: '🌫️' },
  51: { label: 'Light Drizzle',  emoji: '🌦️' },
  53: { label: 'Drizzle',        emoji: '🌦️' },
  55: { label: 'Heavy Drizzle',  emoji: '🌧️' },
  61: { label: 'Light Rain',     emoji: '🌧️' },
  63: { label: 'Rain',           emoji: '🌧️' },
  65: { label: 'Heavy Rain',     emoji: '🌧️' },
  71: { label: 'Light Snow',     emoji: '🌨️' },
  73: { label: 'Snow',           emoji: '❄️' },
  75: { label: 'Heavy Snow',     emoji: '❄️' },
  77: { label: 'Snow Grains',    emoji: '🌨️' },
  80: { label: 'Rain Showers',   emoji: '🌦️' },
  81: { label: 'Showers',        emoji: '🌧️' },
  82: { label: 'Heavy Showers',  emoji: '⛈️' },
  85: { label: 'Snow Showers',   emoji: '🌨️' },
  86: { label: 'Heavy Snow Showers', emoji: '❄️' },
  95: { label: 'Thunderstorm',   emoji: '⛈️' },
  96: { label: 'T-Storm w/ Hail', emoji: '⛈️' },
  99: { label: 'T-Storm w/ Hail', emoji: '⛈️' },
};

export function getWeatherInfo(code: number) {
  return WMO_CODES[code] ?? { label: 'Unknown', emoji: '🌡️' };
}
