import { useState, useEffect } from 'react';

export interface FeedItem {
  title: string;
  link: string;
  description: string;
  thumbnail: string;
  pubDate: string;
  source: string;
}

function extractSource(url: string): string {
  try {
    const host = new URL(url).hostname.replace('www.', '').replace('rss.', '');
    return host.split('.')[0].toUpperCase();
  } catch {
    return 'NEWS';
  }
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export function useRssFeed(feedUrls: string[]) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!feedUrls.length) return;

    setLoading(true);
    setError(null);

    const fetchFeed = async (url: string): Promise<FeedItem[]> => {
      try {
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data.status !== 'ok') throw new Error(data.message || 'Feed error');

        const source = extractSource(url);
        return (data.items || []).map((item: any) => ({
          title: item.title || '',
          link: item.link || '',
          description: stripHtml(item.description || '').slice(0, 200),
          thumbnail: item.thumbnail || item.enclosure?.link || '',
          pubDate: item.pubDate || '',
          source,
        }));
      } catch (err) {
        console.warn(`Failed to fetch feed: ${url}`, err);
        return [];
      }
    };

    Promise.all(feedUrls.filter(Boolean).map(fetchFeed))
      .then((results) => {
        const merged = results
          .flat()
          .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        setItems(merged);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [feedUrls.join(',')]);

  return { items, loading, error };
}
