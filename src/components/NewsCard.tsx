import type { FeedItem } from '../hooks/useRssFeed';
import { X } from 'lucide-react';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface NewsCardProps {
  item: FeedItem;
  isRead?: boolean;
  onClick?: () => void;
  onDismiss?: () => void;
}

export function NewsCard({ item, isRead, onClick, onDismiss }: NewsCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      window.open(item.link, '_blank', 'noopener,noreferrer');
      // Delay the state update slightly to ensure the window opens smoothly before React unmounts it
      setTimeout(onClick, 50);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`group block rounded-xl overflow-hidden glass news-card-hover ${isRead ? 'opacity-50 grayscale-[50%]' : ''}`}
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-white/5 overflow-hidden">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-20">📰</span>
          </div>
        )}
        {/* Source badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-white/80 uppercase tracking-wider">
          {item.source}
        </div>
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white/60 hover:text-white hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
          title="Dismiss article"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white/90 leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {item.title}
        </h3>
        {item.description && (
          <p className="mt-2 text-xs text-white/45 leading-relaxed line-clamp-3">
            {item.description}
          </p>
        )}
        {item.pubDate && (
          <p className="mt-3 text-[10px] text-white/30 uppercase tracking-wide">
            {timeAgo(item.pubDate)}
          </p>
        )}
      </div>
    </a>
  );
}
