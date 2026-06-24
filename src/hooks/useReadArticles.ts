import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'horizon_read_articles';

export function getCleanUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    // Remove query parameters and hashes for a canonical URL key
    return url.origin + url.pathname;
  } catch {
    return urlStr;
  }
}

function getChromeStorage() {
  return typeof chrome !== 'undefined' && chrome.storage?.local
    ? chrome.storage.local
    : null;
}

export function useReadArticles() {
  const [readUrls, setReadUrls] = useState<Set<string>>(new Set());

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
                storage.set({ [STORAGE_KEY]: cleaned });
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
      const handleChromeStorageChange = (changes: Record<string, any>, areaName: string) => {
        if (areaName === 'local' && changes[STORAGE_KEY]) {
          setReadUrls(new Set(changes[STORAGE_KEY].newValue || []));
        }
      };
      chrome.storage.onChanged.addListener(handleChromeStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleChromeStorageChange);
    } else {
      // Fallback for dev mode — use localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setReadUrls(new Set(JSON.parse(saved)));
        }
      } catch (err) {
        console.error('Failed to read from localStorage:', err);
      }

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
      
      const arr = Array.from(next);
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
