import { useState, useEffect } from 'react';
import {
  getMainDomain,
  getMainDomainUrl,
  isRootUrl,
  getSiteDisplayName,
} from '../lib/domain';

export interface TopSite {
  title: string;
  url: string;
}

const DEFAULT_SITES: TopSite[] = [
  { title: 'Google', url: 'https://google.com' },
  { title: 'YouTube', url: 'https://youtube.com' },
  { title: 'GitHub', url: 'https://github.com' },
  { title: 'Reddit', url: 'https://reddit.com' },
  { title: 'Twitter', url: 'https://twitter.com' },
  { title: 'Stack Overflow', url: 'https://stackoverflow.com' },
  { title: 'Wikipedia', url: 'https://wikipedia.org' },
  { title: 'Amazon', url: 'https://amazon.com' },
];

interface GroupedSite {
  domain: string;
  title: string;
  hasRootTitle: boolean;
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
          maxResults: 3000,
        },
        (historyItems) => {
          if (historyItems && historyItems.length > 0) {
            const grouped = new Map<string, GroupedSite>();

            for (const item of historyItems) {
              if (!item.url) continue;

              // Only process http/https URLs
              if (!item.url.startsWith('http://') && !item.url.startsWith('https://')) {
                continue;
              }

              const domain = getMainDomain(item.url);
              if (!domain) continue;

              const mainUrl = getMainDomainUrl(item.url);
              if (!mainUrl) continue;

              const visitCount = item.visitCount || 1;
              const isRoot = isRootUrl(item.url);
              const existing = grouped.get(domain);

              if (existing) {
                existing.visitCount += visitCount;

                // Prioritize root-page titles (e.g. "GitHub" over deep page names)
                if (isRoot && item.title && !existing.hasRootTitle) {
                  existing.title = item.title;
                  existing.hasRootTitle = true;
                } else if (
                  !existing.hasRootTitle &&
                  item.title &&
                  (!existing.title || visitCount > existing.maxIndividualVisitCount)
                ) {
                  existing.title = item.title;
                  existing.maxIndividualVisitCount = visitCount;
                }
              } else {
                grouped.set(domain, {
                  domain,
                  title: item.title || '',
                  hasRootTitle: isRoot && Boolean(item.title),
                  url: mainUrl,
                  visitCount,
                  maxIndividualVisitCount: visitCount,
                });
              }
            }

            // Convert map to array, sort by total visitCount descending, and derive site names
            const sortedSites = Array.from(grouped.values())
              .sort((a, b) => b.visitCount - a.visitCount)
              .slice(0, max)
              .map(site => ({
                title: getSiteDisplayName(site.domain, site.title),
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
            const seenDomains = new Set<string>();
            const collapsed: TopSite[] = [];

            for (const item of results) {
              if (!item.url) continue;
              if (!item.url.startsWith('http://') && !item.url.startsWith('https://')) continue;

              const domain = getMainDomain(item.url);
              if (!domain || seenDomains.has(domain)) continue;
              seenDomains.add(domain);

              const mainUrl = getMainDomainUrl(item.url);
              if (!mainUrl) continue;

              collapsed.push({
                title: getSiteDisplayName(domain, item.title),
                url: mainUrl,
              });

              if (collapsed.length >= max) break;
            }

            setSites(collapsed.length > 0 ? collapsed : DEFAULT_SITES);
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

