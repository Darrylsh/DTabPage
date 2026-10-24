import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'horizon_read_articles';
const MAX_READ_ARTICLES = 1000;

export function getCleanUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    // Remove marketing/tracking query parameters while preserving content IDs
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'src',
      'ref',
      'fbclid',
      'gclid',
      'mc_cid',
      'mc_eid',
    ];
    trackingParams.forEach((param) => url.searchParams.delete(param));
    url.hash = '';

    // If query parameters are now empty, return origin + pathname
    if (url.searchParams.toString() === '') {
      let clean = url.origin + url.pathname;
      if (clean.endsWith('/') && url.pathname !== '/') {
        clean = clean.slice(0, -1);
      }
      return clean;
    }

    return url.toString();
  } catch {
    return urlStr;
  }
}

function getChromeStorage() {
  return typeof chrome !== 'undefined' && chrome.storage?.local
    ? chrome.storage.local
    : null;
}

function loadInitialReadUrls(): Set<string> {
  const storage = getChromeStorage();
  if (storage) return new Set();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch { /* ignore */ }
  return new Set();
}

export function useReadArticles() {
  const [readUrls, setReadUrls] = useState<Set<string>>(loadInitialReadUrls);

  useEffect(() => {
    const storage = getChromeStorage();
    if (storage) {
      // Load from chrome.storage.local
      storage.get([STORAGE_KEY], (result) => {
        if (result[STORAGE_KEY]) {
          setReadUrls(new Set(result[STORAGE_KEY] as string[]));
        } else {
          // Migrate old data from localStorage if available
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const cleaned = parsed.map(getCleanUrl);
                storage.set({ [STORAGE_KEY]: cleaned.slice(-MAX_READ_ARTICLES) });
                setReadUrls(new Set(cleaned));
                localStorage.removeItem(STORAGE_KEY);
              }
            }
          } catch (err) {
            console.warn('Failed to migrate localStorage to chrome.storage.local:', err);
          }
        }
      });

      // Listen for changes from other tabs/background contexts
      const handleChromeStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
        if (areaName === 'local' && changes[STORAGE_KEY]) {
          setReadUrls(new Set((changes[STORAGE_KEY].newValue as string[]) || []));
        }
      };
      chrome.storage.onChanged.addListener(handleChromeStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleChromeStorageChange);
    } else {
      // Listen for changes from other tabs of the same origin in dev mode
      const handleLocalStorageChange = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            setReadUrls(new Set(JSON.parse(e.newValue)));
          } catch (err) {
            console.warn('Failed to parse synchronized read articles:', err);
          }
        }
      };
      window.addEventListener('storage', handleLocalStorageChange);
      return () => window.removeEventListener('storage', handleLocalStorageChange);
    }
  }, []);

  const markAsRead = useCallback((url: string) => {
    const cleanUrl = getCleanUrl(url);
    setReadUrls((prev) => {
      if (prev.has(cleanUrl)) return prev; // Avoid redundant writes
      const next = new Set(prev);
      next.add(cleanUrl);

      // Keep only most recent articles to avoid storage explosion
      const arr = Array.from(next).slice(-MAX_READ_ARTICLES);
      const storage = getChromeStorage();
      if (storage) {
        storage.set({ [STORAGE_KEY]: arr });
      } else {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
        } catch (err) {
          console.error('Failed to write to localStorage:', err);
        }
      }
      return next;
    });
  }, []);

  return { readUrls, markAsRead };
}
