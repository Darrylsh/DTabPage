import { useState, useEffect } from 'react';

export interface TopSite {
  title: string;
  url: string;
}

const DEFAULT_SITES: TopSite[] = [
  { title: 'Google', url: 'https://www.google.com' },
  { title: 'YouTube', url: 'https://www.youtube.com' },
  { title: 'GitHub', url: 'https://github.com' },
  { title: 'Reddit', url: 'https://www.reddit.com' },
  { title: 'Twitter', url: 'https://twitter.com' },
  { title: 'Stack Overflow', url: 'https://stackoverflow.com' },
  { title: 'Wikipedia', url: 'https://www.wikipedia.org' },
  { title: 'Amazon', url: 'https://www.amazon.com' },
];

function cleanUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    // Only process http/https URLs
    if (!url.protocol.startsWith('http')) return '';

    // Strip search params and hash
    url.search = '';
    url.hash = '';

    const pathSegments = url.pathname.split('/').filter(Boolean);

    // Identify product pages, search queries, etc. to collapse them
    const isProductOrSearch = pathSegments.some(seg =>
      ['dp', 'gp', 'product', 'item', 'search', 'query', 'search_results'].includes(seg.toLowerCase())
    );

    if (isProductOrSearch || pathSegments.length > 2) {
      // If it's a deep page but has a valid non-product first segment (e.g. org/username on GitHub/Twitter)
      // collapse to origin + first segment. Otherwise collapse to origin.
      if (pathSegments.length > 0 && !['dp', 'gp', 'product', 'item', 'search'].includes(pathSegments[0].toLowerCase())) {
        return `${url.origin}/${pathSegments[0]}`;
      }
      return url.origin;
    }

    let cleaned = url.origin + url.pathname;
    if (cleaned.endsWith('/')) {
      cleaned = cleaned.slice(0, -1);
    }
    return cleaned;
  } catch {
    return '';
  }
}

function cleanTitle(title: string, url: string): string {
  if (!title) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }
  return title
    .replace(/\s*-\s*Google Search\s*$/i, '')
    .replace(/\s*-\s*Search\s*$/i, '')
    .replace(/\s*\|\s*GitHub\s*$/i, '')
    .replace(/\s*-\s*YouTube\s*$/i, '')
    .replace(/\s*:\s*Online Shopping[^]*$/i, '')
    .trim();
}

interface GroupedSite {
  title: string;
  url: string;
  visitCount: number;
  maxIndividualVisitCount: number;
}

export function useTopSites(max = 24) {
  const [sites, setSites] = useState<TopSite[]>([]);

  useEffect(() => {
    // 1. Try to use Chrome History API
    if (typeof chrome !== 'undefined' && chrome.history) {
      const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      
      chrome.history.search(
        {
          text: '',
          startTime: oneMonthAgo,
          maxResults: 2000,
        },
        (historyItems) => {
          if (historyItems && historyItems.length > 0) {
            const grouped = new Map<string, GroupedSite>();

            for (const item of historyItems) {
              if (!item.url) continue;

              const cleaned = cleanUrl(item.url);
              if (!cleaned) continue;

              const visitCount = item.visitCount || 1;
              const existing = grouped.get(cleaned);

              if (existing) {
                existing.visitCount += visitCount;
                if (item.title && (!existing.title || (item.visitCount || 0) > existing.maxIndividualVisitCount)) {
                  existing.title = item.title;
                  existing.maxIndividualVisitCount = item.visitCount || 0;
                }
              } else {
                grouped.set(cleaned, {
                  title: item.title || '',
                  url: cleaned,
                  visitCount,
                  maxIndividualVisitCount: item.visitCount || 0,
                });
              }
            }

            // Convert map to array, sort by total visitCount descending, and clean titles
            const sortedSites = Array.from(grouped.values())
              .sort((a, b) => b.visitCount - a.visitCount)
              .slice(0, max)
              .map(site => ({
                title: cleanTitle(site.title, site.url),
                url: site.url,
              }));

            setSites(sortedSites);
          } else {
            // Fallback to topSites if history is empty
            fallbackToTopSites();
          }
        }
      );
    } else {
      // Dev mode or not in extension environment
      setSites(DEFAULT_SITES);
    }

    function fallbackToTopSites() {
      if (typeof chrome !== 'undefined' && chrome.topSites) {
        chrome.topSites.get((results) => {
          if (results && results.length > 0) {
            setSites(results.slice(0, max));
          } else {
            setSites(DEFAULT_SITES);
          }
        });
      } else {
        setSites(DEFAULT_SITES);
      }
    }
  }, [max]);

  return sites;
}
