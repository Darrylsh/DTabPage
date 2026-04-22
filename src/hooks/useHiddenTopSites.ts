import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'horizon_hidden_topsites';

export function useHiddenTopSites() {
  const [hiddenUrls, setHiddenUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHiddenUrls(new Set(JSON.parse(saved)));
      }
    } catch {
      // Ignore
    }
  }, []);

  const hideSite = useCallback((url: string) => {
    setHiddenUrls((prev) => {
      const next = new Set(prev);
      next.add(url);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  return { hiddenUrls, hideSite };
}
