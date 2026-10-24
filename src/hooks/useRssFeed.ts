import { useState, useEffect, useCallback, useRef } from 'react';
import {
  type FeedItem,
  cleanHtmlText,
  parseRssXml,
  fetchFeedXml,
} from '../lib/rssParser';

export type { FeedItem };
export { cleanHtmlText };

const STORAGE_CACHE_KEY = 'horizon_cached_news_items';
const AUTO_REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

function parseDateToTime(dateStr: string): number {
  if (!dateStr) return 0;
  const time = new Date(dateStr).getTime();
  return isNaN(time) ? 0 : time;
}

function loadInitialFeedCache(): FeedItem[] {
  try {
    const cached = localStorage.getItem(STORAGE_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch { /* ignore */ }
  return [];
}

function mergeFeedItems(existing: FeedItem[], incoming: FeedItem[]): FeedItem[] {
  if (!incoming.length) return existing;
  if (!existing.length) return incoming;

  const itemMap = new Map<string, FeedItem>();

  // Add existing items first
  for (const item of existing) {
    if (item.link) {
      itemMap.set(item.link, item);
    }
  }

  // Add or update with incoming items
  for (const item of incoming) {
    if (item.link) {
      itemMap.set(item.link, item);
    }
  }

  return Array.from(itemMap.values())
    .sort((a, b) => parseDateToTime(b.pubDate) - parseDateToTime(a.pubDate))
    .slice(0, 100);
}

function saveFeedCache(items: FeedItem[]) {
  try {
    const slice = items.slice(0, 100);
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(slice));
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [STORAGE_CACHE_KEY]: slice });
    }
  } catch { /* ignore */ }
}

export function useRssFeed(feedUrls: string[]) {
  const [items, setItems] = useState<FeedItem[]>(loadInitialFeedCache);
  // Only show initial skeleton loading if we have NO cached items at all
  const [loading, setLoading] = useState<boolean>(() => loadInitialFeedCache().length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshCounterRef = useRef(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(() => {
    refreshCounterRef.current += 1;
    setRefreshTrigger(refreshCounterRef.current);
  }, []);

  // Also check chrome.storage.local on mount for any fresher cross-tab cache
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get([STORAGE_CACHE_KEY], (res) => {
        const stored = res[STORAGE_CACHE_KEY];
        if (Array.isArray(stored) && stored.length > 0) {
          setItems((prev) => {
            if (prev.length === 0) return stored;
            return mergeFeedItems(prev, stored);
          });
          setLoading(false);
        }
      });
    }
  }, []);

  const feedUrlsKey = feedUrls.filter(Boolean).join(',');

  useEffect(() => {
    const urls = feedUrlsKey ? feedUrlsKey.split(',') : [];
    if (!urls.length) {
      return;
    }

    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) setIsRefreshing(true);
    });

    const fetchFeed = async (url: string): Promise<FeedItem[]> => {
      try {
        const xmlText = await fetchFeedXml(url);
        return parseRssXml(xmlText, url);
      } catch (err) {
        console.warn(`Failed to fetch RSS feed: ${url}`, err);
        return [];
      }
    };

    // Fetch all feeds concurrently and merge each progressively as it arrives
    let successCount = 0;
    const fetchPromises = urls.map(async (url) => {
      const feedItems = await fetchFeed(url);
      if (!isMounted || !feedItems.length) return;

      successCount++;
      setItems((prev) => {
        const merged = mergeFeedItems(prev, feedItems);
        saveFeedCache(merged);
        return merged;
      });
      setLoading(false);
    });

    Promise.all(fetchPromises)
      .then(() => {
        if (!isMounted) return;
        if (successCount === 0) {
          setItems((prev) => {
            if (prev.length === 0) {
              setError('Could not fetch news articles from the configured feeds.');
            }
            return prev;
          });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setItems((prev) => {
            if (prev.length === 0) setError(err.message);
            return prev;
          });
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
          setIsRefreshing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [feedUrlsKey, refreshTrigger]);

  // Auto-refresh periodically if the tab is kept open
  useEffect(() => {
    const timer = setInterval(() => {
      refresh();
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [refresh]);

  return { items, loading, isRefreshing, error, refresh };
}
