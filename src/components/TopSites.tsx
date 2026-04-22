import { useState } from 'react';
import { X, Globe } from 'lucide-react';
import { useTopSites } from '../hooks/useTopSites';
import { useHiddenTopSites } from '../hooks/useHiddenTopSites';

function getFavicon(url: string) {
  try {
    // Use the gstatic v2 API which is more reliable for sz=64
    return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(url)}&size=64`;
  } catch {
    return '';
  }
}

function getShortName(title: string, url: string) {
  if (title && title.length > 0) {
    return title.length > 12 ? title.slice(0, 11) + '…' : title;
  }
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function TopSites() {
  const sites = useTopSites(24);
  const { hiddenUrls, hideSite } = useHiddenTopSites();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const filteredSites = sites.filter(site => !hiddenUrls.has(site.url));

  if (filteredSites.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <div className="grid grid-cols-8 gap-3">
        {filteredSites.map((site) => (
          <div key={site.url} className="relative group">
            <a
              href={site.url}
              className="
                flex flex-col items-center gap-1.5 p-2.5 rounded-xl
                hover:bg-white/5 transition-all duration-200
                hover:scale-105
              "
              title={site.title || site.url}
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden group-hover:glow-blue-sm transition-shadow duration-200">
                {imageErrors[site.url] ? (
                  <Globe className="w-5 h-5 text-white/20" />
                ) : (
                  <img
                    src={getFavicon(site.url)}
                    alt=""
                    className="w-6 h-6"
                    onError={() => setImageErrors(prev => ({ ...prev, [site.url]: true }))}
                  />
                )}
              </div>
              <span className="text-[11px] text-white/60 group-hover:text-white/90 transition-colors text-center leading-tight truncate w-full">
                {getShortName(site.title, site.url)}
              </span>
            </a>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                hideSite(site.url);
              }}
              className="
                absolute top-0 right-0 p-1 rounded-full 
                bg-black/60 text-white/40 hover:text-white hover:bg-black/80
                opacity-0 group-hover:opacity-100 transition-all duration-200
                z-10 translate-x-1 -translate-y-1
              "
              title="Remove from top sites"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
