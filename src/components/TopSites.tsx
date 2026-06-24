import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Globe, Pencil, Plus, Pin } from 'lucide-react';
import { useTopSites } from '../hooks/useTopSites';
import { useHiddenTopSites } from '../hooks/useHiddenTopSites';
import { useCustomQuickLinks, type CustomLink } from '../hooks/useCustomQuickLinks';

function getFavicon(url: string) {
  try {
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

function normalizeUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    let normalized = url.origin + url.pathname;
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized.toLowerCase();
  } catch {
    return urlStr.toLowerCase();
  }
}

export function TopSites() {
  const browserSites = useTopSites(24);
  const { hiddenUrls, hideSite } = useHiddenTopSites();
  const { customLinks, addLink, updateLink, removeLink } = useCustomQuickLinks();
  
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [editingSite, setEditingSite] = useState<CustomLink | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');

  const allSites = useMemo(() => {
    const filteredBrowser = browserSites.filter(site => !hiddenUrls.has(site.url));
    const customNormalized = new Set(customLinks.map(link => normalizeUrl(link.url)));
    
    // Map custom links with custom flag
    const combined = customLinks.map(link => ({
      ...link,
      isCustom: true
    }));
    
    // Add non-duplicate browser links
    filteredBrowser.forEach(site => {
      const norm = normalizeUrl(site.url);
      if (!customNormalized.has(norm)) {
        combined.push({
          ...site,
          isCustom: false
        });
      }
    });
    
    return combined.slice(0, 24);
  }, [browserSites, hiddenUrls, customLinks]);

  const handleEdit = (site: CustomLink) => {
    setEditingSite(site);
    setFormTitle(site.title);
    setFormUrl(site.url);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormTitle('');
    setFormUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUrl) return;

    const formattedUrl = formUrl.startsWith('http') ? formUrl : `https://${formUrl}`;

    if (editingSite) {
      // If it was a browser site, we need to "hide" the original and add the custom one
      const isBrowserSite = browserSites.some(s => s.url === editingSite.url);
      if (isBrowserSite && editingSite.url !== formattedUrl) {
        hideSite(editingSite.url);
      }
      
      // Update custom links
      const alreadyInCustom = customLinks.some(l => l.url === editingSite.url);
      if (alreadyInCustom) {
        updateLink(editingSite.url, formTitle, formattedUrl);
      } else {
        addLink(formTitle, formattedUrl);
        hideSite(editingSite.url);
      }
    } else {
      addLink(formTitle, formattedUrl);
    }
    
    closeForm();
  };

  const closeForm = () => {
    setEditingSite(null);
    setIsAdding(false);
    setFormTitle('');
    setFormUrl('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in relative">
      <div className="grid grid-cols-8 gap-3">
        {allSites.map((site) => (
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
              <span className="text-[11px] text-white/60 group-hover:text-white/90 transition-colors text-center leading-tight truncate w-full flex items-center justify-center gap-1 px-1">
                {site.isCustom && <Pin className="w-2.5 h-2.5 text-blue-400/80 rotate-45 flex-shrink-0" />}
                <span className="truncate">{getShortName(site.title, site.url)}</span>
              </span>
            </a>
            
            <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 -translate-y-2 z-20">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleEdit(site);
                }}
                className="p-1 rounded-full bg-black/60 text-white/40 hover:text-white hover:bg-blue-500/80 transition-colors"
                title="Edit link"
              >
                <Pencil className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (site.isCustom) {
                    removeLink(site.url);
                  } else {
                    hideSite(site.url);
                  }
                }}
                className="p-1 rounded-full bg-black/60 text-white/40 hover:text-white hover:bg-red-500/80 transition-colors"
                title="Remove site"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        ))}

        {/* Add button */}
        {allSites.length < 24 && (
          <button
            onClick={handleAdd}
            className="
              flex flex-col items-center gap-1.5 p-2.5 rounded-xl
              hover:bg-white/5 transition-all duration-200
              hover:scale-105 group
            "
            title="Add custom link"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
              <Plus className="w-5 h-5 text-white/40 group-hover:text-white/60" />
            </div>
            <span className="text-[11px] text-white/40 group-hover:text-white/60 transition-colors">
              Add Link
            </span>
          </button>
        )}
      </div>

      {/* Edit/Add Modal */}
      {(editingSite || isAdding) && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-strong p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingSite ? 'Edit Link' : 'Add Link'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. GitHub"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">URL</label>
                <input
                  type="text"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="e.g. github.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-500/25 transition-all"
                >
                  {editingSite ? 'Save Changes' : 'Add Link'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
