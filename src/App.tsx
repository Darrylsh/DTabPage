import { useState, useMemo, useEffect } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useSettings } from './hooks/useSettings';
import { Clock } from './components/Clock';
import { SearchBar } from './components/SearchBar';
import { TopSites } from './components/TopSites';
import { NewsGrid } from './components/NewsGrid';
import { WordOfDay } from './components/WordOfDay';
import { SettingsSidebar } from './components/SettingsSidebar';
import { dailyIndex } from './lib/utils';

// Curated Unsplash collection — nature/landscape, dark-friendly
const BG_IMAGES = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80',
  'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=1920&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1920&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&q=80',
  'https://images.unsplash.com/photo-1518173946687-a4c82a7d-7f54?w=1920&q=80',
  'https://images.unsplash.com/photo-1500534314263-0869cef25736?w=1920&q=80',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1920&q=80',
  'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=1920&q=80',
  'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1920&q=80',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1920&q=80',
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1920&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
  'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=1920&q=80',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1920&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&q=80',
];

export default function App() {
  const { settings, updateSettings, loaded } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const bgUrl = useMemo(() => BG_IMAGES[dailyIndex(BG_IMAGES.length)], []);
  const feedUrls = useMemo(
    () => settings.feedUrls.filter(Boolean),
    [settings.feedUrls]
  );

  useEffect(() => {
    document.title = "Little D's New Tab Page";
  }, []);

  if (!loaded) return null;

  return (
    <div className="dark relative min-h-screen">
      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="flex items-start justify-between p-4">
          {/* Word of Day — top left */}
          <WordOfDay hskLevel={settings.hskLevel} language={settings.language} />

          {/* Settings gear — top right */}
          <button
            id="settings-toggle"
            onClick={() => setSettingsOpen(true)}
            className="p-2.5 rounded-xl glass hover:bg-white/10 transition-all duration-200 hover:scale-105"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Center section */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4 -mt-16">
          <Clock />
          <SearchBar searchEngine={settings.searchEngine} />
          <TopSites />
        </div>

        {/* News section */}
        <div className="px-6 pb-8 pt-4">
          <NewsGrid feedUrls={feedUrls} />
        </div>
      </div>

      {/* Settings sidebar */}
      <SettingsSidebar
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
      />
    </div>
  );
}
