import { useState, useEffect, useCallback } from 'react';

export interface CustomLink {
  title: string;
  url: string;
}

const STORAGE_KEY = 'horizon_custom_links';

export function useCustomQuickLinks() {
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCustomLinks(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  const addLink = useCallback((title: string, url: string) => {
    setCustomLinks((prev) => {
      const next = [...prev, { title, url }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateLink = useCallback((oldUrl: string, newTitle: string, newUrl: string) => {
    setCustomLinks((prev) => {
      const next = prev.map((link) => 
        link.url === oldUrl ? { title: newTitle, url: newUrl } : link
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeLink = useCallback((url: string) => {
    setCustomLinks((prev) => {
      const next = prev.filter((link) => link.url !== url);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { customLinks, addLink, updateLink, removeLink };
}
