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
    'https://feeds.bbci.co.uk/news/rss.xml',
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

function migrateFeedUrls(feedUrls: string[]): { urls: string[]; migrated: boolean } {
  let migrated = false;
  const updatedUrls = feedUrls.map((url) => {
    if (url && (url.includes('rss.cnn.com') || (url.includes('cnn.com') && url.includes('rss')))) {
      migrated = true;
      return 'https://feeds.bbci.co.uk/news/rss.xml';
    }
    return url;
  });

  const uniqueUrls = Array.from(new Set(updatedUrls.filter(Boolean)));
  if (uniqueUrls.length !== feedUrls.length) {
    migrated = true;
  }
  return { urls: uniqueUrls.length > 0 ? uniqueUrls : DEFAULTS.feedUrls, migrated };
}

function loadInitialSettings(): { settings: Settings; loaded: boolean } {
  const storage = getChromeStorage();
  if (storage) {
    return { settings: DEFAULTS, loaded: false };
  }
  try {
    const saved = localStorage.getItem('horizon_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      const { urls, migrated } = migrateFeedUrls(parsed.feedUrls || DEFAULTS.feedUrls);
      const merged: Settings = { ...DEFAULTS, ...parsed, feedUrls: urls };
      if (migrated) {
        localStorage.setItem('horizon_settings', JSON.stringify(merged));
      }
      return { settings: merged, loaded: true };
    }
  } catch { /* ignore */ }
  return { settings: DEFAULTS, loaded: true };
}

export function useSettings() {
  const [initial] = useState(loadInitialSettings);
  const [settings, setSettings] = useState<Settings>(initial.settings);
  const [loaded, setLoaded] = useState(initial.loaded);

  useEffect(() => {
    const storage = getChromeStorage();
    if (!storage) return;

    storage.get(Object.keys(DEFAULTS), (items) => {
      const partial = items as Partial<Settings>;
      const { urls, migrated } = migrateFeedUrls(partial.feedUrls || DEFAULTS.feedUrls);
      const merged: Settings = { ...DEFAULTS, ...partial, feedUrls: urls };

      if (migrated) {
        storage.set({ feedUrls: urls });
      }

      setSettings(merged);
      setLoaded(true);
    });
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
