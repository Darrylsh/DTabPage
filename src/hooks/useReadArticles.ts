import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'horizon_read_articles';

export function useReadArticles() {
  const [readUrls, setReadUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setReadUrls(new Set(JSON.parse(saved)));
      }
    } catch {
      // Ignore
    }
  }, []);

  const markAsRead = useCallback((url: string) => {
    setReadUrls((prev) => {
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

  return { readUrls, markAsRead };
}
