export interface FeedItem {
  title: string;
  link: string;
  description: string;
  thumbnail: string;
  pubDate: string;
  source: string;
}

const KNOWN_SOURCES: Record<string, string> = {
  bbci: 'BBC',
  bbc: 'BBC',
  nytimes: 'NYT',
  cnn: 'CNN',
  engadget: 'ENGADGET',
  techcrunch: 'TECHCRUNCH',
  theverge: 'VERGE',
  wired: 'WIRED',
  npr: 'NPR',
  reuters: 'REUTERS',
  bloomberg: 'BLOOMBERG',
  wsj: 'WSJ',
  cnbc: 'CNBC',
  ign: 'IGN',
  kotaku: 'KOTAKU',
  pcgamer: 'PC GAMER',
  nasa: 'NASA',
  phys: 'PHYS.ORG',
  space: 'SPACE.COM',
  espn: 'ESPN',
  si: 'SPORTS ILLUS',
};

export function extractSource(url: string): string {
  try {
    const host = new URL(url).hostname
      .replace(/^www\./, '')
      .replace(/^rss\./, '')
      .replace(/^feeds\./, '');
    const prefix = host.split('.')[0].toLowerCase();
    if (KNOWN_SOURCES[prefix]) {
      return KNOWN_SOURCES[prefix];
    }
    return prefix.toUpperCase() || 'NEWS';
  } catch {
    return 'NEWS';
  }
}

export function cleanHtmlText(html: string): string {
  if (!html) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.querySelectorAll('script, style, noscript').forEach((el) => el.remove());
    let text = doc.body.textContent || '';

    // Decode a second pass if entities were double-escaped (e.g. &amp;amp; or &amp;#39;)
    if (/&[a-zA-Z0-9#xX]+;/.test(text)) {
      const secondDoc = parser.parseFromString(text, 'text/html');
      text = secondDoc.body.textContent || text;
    }

    return text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  } catch {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    let text = tmp.textContent || tmp.innerText || '';
    if (/&[a-zA-Z0-9#xX]+;/.test(text)) {
      tmp.innerHTML = text;
      text = tmp.textContent || tmp.innerText || '';
    }
    return text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

function getTagText(parent: Element, tagNames: string[]): string {
  for (const tag of tagNames) {
    const els = parent.getElementsByTagName(tag);
    if (els.length > 0 && els[0].textContent) {
      return els[0].textContent.trim();
    }
    if (tag.includes(':')) {
      const localName = tag.split(':')[1];
      const nsEls = parent.getElementsByTagNameNS('*', localName);
      if (nsEls.length > 0 && nsEls[0].textContent) {
        return nsEls[0].textContent.trim();
      }
    }
  }
  return '';
}

function getTagAttr(parent: Element, tagNames: string[], attrName: string): string {
  for (const tag of tagNames) {
    const els = parent.getElementsByTagName(tag);
    if (els.length > 0) {
      const val = els[0].getAttribute(attrName);
      if (val) return val.trim();
    }
    if (tag.includes(':')) {
      const localName = tag.split(':')[1];
      const nsEls = parent.getElementsByTagNameNS('*', localName);
      if (nsEls.length > 0) {
        const val = nsEls[0].getAttribute(attrName);
        if (val) return val.trim();
      }
    }
  }
  return '';
}

function findThumbnail(item: Element, rawDesc: string): string {
  // 1. media:content or media:thumbnail url
  const mediaUrl = getTagAttr(item, ['media:content', 'media:thumbnail'], 'url');
  if (mediaUrl) return mediaUrl;

  // 2. enclosure with image type or extension
  const enclosures = item.getElementsByTagName('enclosure');
  for (let i = 0; i < enclosures.length; i++) {
    const enc = enclosures[i];
    const type = enc.getAttribute('type') || '';
    const url = enc.getAttribute('url') || '';
    if ((type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)/i.test(url)) && url) {
      return url;
    }
  }

  // 3. <img> tag in description or content
  if (rawDesc) {
    const imgMatch = rawDesc.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
  }

  return '';
}

export function parseRssXml(xmlText: string, feedUrl: string): FeedItem[] {
  if (!xmlText || typeof xmlText !== 'string') return [];

  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'text/xml');
  const parseError = xml.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid XML feed');
  }

  const source = extractSource(feedUrl);
  const items: FeedItem[] = [];

  // 1. Check for RSS 2.0 / 1.0 <item>
  const rssItems = Array.from(xml.getElementsByTagName('item'));
  if (rssItems.length > 0) {
    for (const item of rssItems) {
      const title = getTagText(item, ['title']);

      let link = '';
      const linkEl = item.getElementsByTagName('link')[0];
      if (linkEl) {
        link = linkEl.textContent?.trim() || linkEl.getAttribute('href') || '';
      }
      if (!link) {
        const guidEl = item.getElementsByTagName('guid')[0];
        if (guidEl && guidEl.textContent?.trim().startsWith('http')) {
          link = guidEl.textContent.trim();
        }
      }

      const rawDesc = getTagText(item, ['description', 'content:encoded', 'content']);
      const pubDate = getTagText(item, ['pubDate', 'dc:date', 'date']);
      const thumbnail = findThumbnail(item, rawDesc);

      if (title || link) {
        items.push({
          title: cleanHtmlText(title),
          link,
          description: cleanHtmlText(rawDesc).slice(0, 200),
          thumbnail,
          pubDate,
          source,
        });
      }
    }
    return items;
  }

  // 2. Check for Atom <entry>
  const atomEntries = Array.from(xml.getElementsByTagName('entry'));
  if (atomEntries.length > 0) {
    for (const entry of atomEntries) {
      const title = getTagText(entry, ['title']);

      let link = '';
      const linkEls = Array.from(entry.getElementsByTagName('link'));
      const altLink = linkEls.find((l) => l.getAttribute('rel') === 'alternate') || linkEls[0];
      if (altLink) {
        link = altLink.getAttribute('href') || altLink.textContent?.trim() || '';
      }

      const rawDesc = getTagText(entry, ['summary', 'content']);
      const pubDate = getTagText(entry, ['published', 'updated']);
      const thumbnail = findThumbnail(entry, rawDesc);

      if (title || link) {
        items.push({
          title: cleanHtmlText(title),
          link,
          description: cleanHtmlText(rawDesc).slice(0, 200),
          thumbnail,
          pubDate,
          source,
        });
      }
    }
    return items;
  }

  return items;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 3500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function fetchFeedXml(url: string): Promise<string> {
  // First attempt: direct fetch (instant in Chrome extension with host_permissions)
  try {
    const res = await fetchWithTimeout(url, {
      headers: {
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    }, 3000);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 0) {
        return text;
      }
    }
  } catch (directErr) {
    // In dev mode or before extension reload, direct fetch may fail CORS
    console.warn(`Direct fetch failed for ${url}, trying fast proxy fallback...`, directErr);
  }

  // Fast Fallback 1: corsproxy.io (~200ms response time)
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const res = await fetchWithTimeout(proxyUrl, {}, 3500);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 0) {
        return text;
      }
    }
  } catch (proxyErr) {
    console.warn(`Corsproxy fallback failed for ${url}:`, proxyErr);
  }

  // Fallback 2: allorigins as last resort
  try {
    const backupUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetchWithTimeout(backupUrl, {}, 5000);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 0) {
        return text;
      }
    }
  } catch (backupErr) {
    console.warn(`Allorigins backup failed for ${url}:`, backupErr);
  }

  throw new Error(`Failed to fetch RSS feed from ${url}`);
}
