const SECOND_LEVEL_DOMAINS = new Set([
  'co', 'com', 'org', 'net', 'edu', 'gov', 'gob', 'govt', 'ac', 'me',
  'ne', 'or', 'go', 'gen', 'firm', 'ind', 'ltd', 'plc', 'sch', 'school',
  'res', 'mil', 'k12', 'bel', 'pol', 'idv', 'game', 'ebiz', 'club', 'info',
  'biz',
]);

/**
 * Extracts the top-level main domain from a URL or hostname.
 * Examples:
 * - "https://mail.google.com/mail/u/0/" -> "google.com"
 * - "docs.google.com" -> "google.com"
 * - "news.bbc.co.uk" -> "bbc.co.uk"
 * - "https://github.com/microsoft/vscode" -> "github.com"
 * - "localhost" -> "localhost"
 * - "192.168.1.1" -> "192.168.1.1"
 */
export function getMainDomain(urlOrHost: string): string {
  try {
    let input = (urlOrHost || '').trim();
    if (!input) return '';

    // If it has a protocol or slashes, parse via URL constructor
    if (input.includes('://') || input.includes('/')) {
      const parsed = new URL(input.startsWith('http') ? input : `https://${input}`);
      input = parsed.hostname;
    }

    input = input.toLowerCase();

    // Check if IPv4 address (e.g. 127.0.0.1 or 192.168.1.1)
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(input)) {
      return input;
    }

    const parts = input.split('.').filter(Boolean);
    if (parts.length <= 2) {
      return input;
    }

    const tld = parts[parts.length - 1];
    const sld = parts[parts.length - 2];

    // Check for country-code second-level domains (e.g. bbc.co.uk, amazon.co.jp, google.com.au)
    if (tld.length === 2 && SECOND_LEVEL_DOMAINS.has(sld)) {
      return parts.slice(-3).join('.');
    }

    return parts.slice(-2).join('.');
  } catch {
    return (urlOrHost || '').toLowerCase().trim();
  }
}

/**
 * Converts any URL to point cleanly to its main/top-level domain.
 * Strips subdomains (e.g. mail., docs., www.), subpages, queries, and hashes.
 * Examples:
 * - "https://mail.google.com/mail/u/0/#inbox" -> "https://google.com"
 * - "https://www.youtube.com/watch?v=123" -> "https://youtube.com"
 * - "https://news.bbc.co.uk/sport" -> "https://bbc.co.uk"
 * - "http://localhost:5173/page" -> "http://localhost:5173"
 */
export function getMainDomainUrl(urlStr: string): string {
  try {
    const raw = (urlStr || '').trim();
    if (!raw) return '';

    const parsed = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    if (!parsed.protocol.startsWith('http')) {
      return '';
    }

    const mainDomain = getMainDomain(parsed.hostname);
    if (!mainDomain) return '';

    // Handle localhost / IP with custom ports
    const isLocal = mainDomain === 'localhost' || /^(\d{1,3}\.){3}\d{1,3}$/.test(mainDomain);
    if (isLocal) {
      const portPart = parsed.port ? `:${parsed.port}` : '';
      return `${parsed.protocol}//${mainDomain}${portPart}`;
    }

    // Standard web sites point to top-level domain URL with https
    return `https://${mainDomain}`;
  } catch {
    return '';
  }
}

/**
 * Checks whether a URL points to the root of a domain (no subpaths or query).
 */
export function isRootUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    return parsed.pathname === '/' || parsed.pathname === '';
  } catch {
    return false;
  }
}

const KNOWN_SITE_NAMES: Record<string, string> = {
  'google.com': 'Google',
  'youtube.com': 'YouTube',
  'github.com': 'GitHub',
  'reddit.com': 'Reddit',
  'twitter.com': 'Twitter',
  'x.com': 'X',
  'stackoverflow.com': 'Stack Overflow',
  'wikipedia.org': 'Wikipedia',
  'amazon.com': 'Amazon',
  'linkedin.com': 'LinkedIn',
  'netflix.com': 'Netflix',
  'facebook.com': 'Facebook',
  'instagram.com': 'Instagram',
  'twitch.tv': 'Twitch',
  'discord.com': 'Discord',
  'spotify.com': 'Spotify',
  'medium.com': 'Medium',
  'nytimes.com': 'NYTimes',
  'cnn.com': 'CNN',
  'bbc.co.uk': 'BBC',
  'apple.com': 'Apple',
  'microsoft.com': 'Microsoft',
  'yahoo.com': 'Yahoo',
  'duckduckgo.com': 'DuckDuckGo',
};

/**
 * Derives a clean display title for a main domain site.
 */
export function getSiteDisplayName(domain: string, title?: string): string {
  const normDomain = domain.toLowerCase();
  if (KNOWN_SITE_NAMES[normDomain]) {
    return KNOWN_SITE_NAMES[normDomain];
  }

  if (title) {
    let clean = title.trim();

    clean = clean
      .replace(/\s*-\s*Google Search\s*$/i, '')
      .replace(/\s*-\s*Search\s*$/i, '')
      .replace(/\s*:\s*Online Shopping[^]*$/i, '')
      .trim();

    // If title has a separator, extract brand/site segment (e.g. "React - A JavaScript library" -> "React")
    const separators = [' | ', ' - ', ' · ', ' — '];
    for (const sep of separators) {
      if (clean.includes(sep)) {
        const parts = clean.split(sep).map(p => p.trim()).filter(Boolean);
        if (parts.length > 1) {
          const lastPart = parts[parts.length - 1];
          if (lastPart.length >= 2 && lastPart.length <= 25) {
            return lastPart;
          }
          const firstPart = parts[0];
          if (firstPart.length >= 2 && firstPart.length <= 25) {
            return firstPart;
          }
        }
      }
    }

    if (clean.length > 0 && clean.length <= 25) {
      return clean;
    }
  }

  // Fallback: capitalize first label of domain
  const domainPart = normDomain.split('.')[0] || normDomain;
  return domainPart.charAt(0).toUpperCase() + domainPart.slice(1);
}
