import { useState, useEffect, useCallback } from 'react';

export interface Settings {
  searchEngine: 'google' | 'bing' | 'ddg';
  feedUrls: string[];
  hskLevel: string;
  language: 'mandarin' | 'spanish';
}

const DEFAULTS: Settings = {
  searchEngine: 'google',
  feedUrls: [
    'https://rss.cnn.com/rss/cnn_topstories.rss',
    'https://www.engadget.com/rss.xml',
  ],
  hskLevel: '1',
  language: 'mandarin',
};

function getChromeStorage() {
  return typeof chrome !== 'undefined' && chrome.storage?.sync
    ? chrome.storage.sync
    : null;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storage = getChromeStorage();
    if (storage) {
      storage.get(Object.keys(DEFAULTS), (items) => {
        setSettings({ ...DEFAULTS, ...(items as Partial<Settings>) });
        setLoaded(true);
      });
    } else {
      // Fallback for dev mode — use localStorage
      try {
        const saved = localStorage.getItem('horizon_settings');
        if (saved) setSettings(JSON.parse(saved));
      } catch { /* ignore */ }
      setLoaded(true);
    }
  }, []);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      const storage = getChromeStorage();
      if (storage) {
        storage.set(next);
      } else {
        localStorage.setItem('horizon_settings', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  return { settings, updateSettings, loaded };
}
