import { useState, useEffect } from 'react';

export interface TopSite {
  title: string;
  url: string;
}

export function useTopSites(max = 24) {
  const [sites, setSites] = useState<TopSite[]>([]);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.topSites) {
      chrome.topSites.get((results) => {
        setSites(results.slice(0, max));
      });
    } else {
      // Dev fallback
      setSites([
        { title: 'Google', url: 'https://www.google.com' },
        { title: 'YouTube', url: 'https://www.youtube.com' },
        { title: 'GitHub', url: 'https://github.com' },
        { title: 'Reddit', url: 'https://www.reddit.com' },
        { title: 'Twitter', url: 'https://twitter.com' },
        { title: 'Stack Overflow', url: 'https://stackoverflow.com' },
        { title: 'Wikipedia', url: 'https://www.wikipedia.org' },
        { title: 'Amazon', url: 'https://www.amazon.com' },
      ]);
    }
  }, [max]);

  return sites;
}
