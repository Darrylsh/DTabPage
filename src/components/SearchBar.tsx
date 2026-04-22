import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';

const ENGINES: Record<string, string> = {
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  ddg: 'https://duckduckgo.com/?q=',
};

interface SearchBarProps {
  searchEngine: string;
}

export function SearchBar({ searchEngine }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const base = ENGINES[searchEngine] || ENGINES.google;
    window.location.href = base + encodeURIComponent(query.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`
        relative mx-auto w-full max-w-2xl transition-all duration-300
        ${focused ? 'scale-[1.02]' : 'scale-100'}
      `}
    >
      <div
        className={`
          flex items-center gap-3 px-5 py-3.5 rounded-2xl
          glass transition-all duration-300
          ${focused ? 'glow-blue border-white/20' : 'border-white/10'}
        `}
      >
        <Search className="w-5 h-5 text-white/40 flex-shrink-0" />
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={`Search with ${searchEngine === 'ddg' ? 'DuckDuckGo' : searchEngine.charAt(0).toUpperCase() + searchEngine.slice(1)}...`}
          className="flex-1 bg-transparent text-white text-base placeholder:text-white/30 outline-none"
          autoComplete="off"
        />
      </div>
    </form>
  );
}
