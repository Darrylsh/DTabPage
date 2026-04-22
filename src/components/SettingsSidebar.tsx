import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import type { Settings } from '../hooks/useSettings';

interface SettingsSidebarProps {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdate: (partial: Partial<Settings>) => void;
}

export function SettingsSidebar({ open, onClose, settings, onUpdate }: SettingsSidebarProps) {
  const [newFeedUrl, setNewFeedUrl] = useState('');

  const addFeed = () => {
    const url = newFeedUrl.trim();
    if (!url) return;
    if (settings.feedUrls.includes(url)) return;
    onUpdate({ feedUrls: [...settings.feedUrls, url] });
    setNewFeedUrl('');
  };

  const removeFeed = (index: number) => {
    onUpdate({ feedUrls: settings.feedUrls.filter((_, i) => i !== index) });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeed();
    }
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 z-50
          glass-strong rounded-l-2xl
          transform transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col overflow-y-auto
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-display font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="p-5 space-y-6 flex-1">
          {/* Search Engine */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
              Search Engine
            </label>
            <select
              id="settings-search-engine"
              value={settings.searchEngine}
              onChange={(e) => onUpdate({ searchEngine: e.target.value as Settings['searchEngine'] })}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="google" className="bg-gray-900">Google</option>
              <option value="bing" className="bg-gray-900">Bing</option>
              <option value="ddg" className="bg-gray-900">DuckDuckGo</option>
            </select>
          </div>

          {/* RSS Feeds — dynamic add/remove */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
              RSS Feeds
            </label>

            {/* Add new feed */}
            <div className="flex gap-2">
              <input
                id="settings-feed-input"
                type="url"
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com/rss.xml"
                className="flex-1 bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/20"
              />
              <button
                onClick={addFeed}
                disabled={!newFeedUrl.trim()}
                className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                title="Add feed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Feed list */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {settings.feedUrls.map((url, i) => {
                let label: string;
                try {
                  label = new URL(url).hostname.replace('www.', '').replace('rss.', '');
                } catch {
                  label = url;
                }
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 group"
                  >
                    <span className="flex-1 text-xs text-white/60 truncate" title={url}>
                      {label}
                    </span>
                    <button
                      onClick={() => removeFeed(i)}
                      className="p-1 rounded-md text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove feed"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
              {settings.feedUrls.length === 0 && (
                <p className="text-xs text-white/20 text-center py-2">No feeds added</p>
              )}
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
              Language to Learn
            </label>
            <select
              id="settings-language"
              value={settings.language}
              onChange={(e) => onUpdate({ language: e.target.value as Settings['language'] })}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="mandarin" className="bg-gray-900">Mandarin (Chinese)</option>
              <option value="spanish" className="bg-gray-900">Spanish</option>
            </select>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">
              {settings.language === 'mandarin' ? 'HSK Level' : 'Difficulty Level'}
            </label>
            <select
              id="settings-hsk-level"
              value={settings.hskLevel}
              onChange={(e) => onUpdate({ hskLevel: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
            >
              {['1', '2', '3', '4', '5', '6'].map((lvl) => (
                <option key={lvl} value={lvl} className="bg-gray-900">
                  {settings.language === 'mandarin' ? `HSK ${lvl}` : `Level ${lvl}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10">
          <p className="text-[10px] text-white/20 text-center">
            Little D's New Tab Page v1.0
          </p>
        </div>
      </div>
    </>
  );
}
