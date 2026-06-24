import { useState, useEffect, useRef, useCallback } from 'react';
import { useRssFeed } from '../hooks/useRssFeed';
import { useReadArticles, getCleanUrl } from '../hooks/useReadArticles';
import { usePersonalizedNews } from '../hooks/usePersonalizedNews';
import { CATEGORY_KEYWORDS } from '../data/curatedFeeds';
import { NewsCard } from './NewsCard';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsGridProps {
  feedUrls: string[];
}

const PAGE_SIZE = 6;

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden glass animate-pulse">
      <div className="h-40 bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
      </div>
    </div>
  );
}

export function NewsGrid({ feedUrls }: NewsGridProps) {
  const { items, loading, error } = useRssFeed(feedUrls);
  const { readUrls, markAsRead } = useReadArticles();
  const { interests } = usePersonalizedNews(feedUrls);
  const [showRead, setShowRead] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const checkIsRecommended = useCallback((title: string, desc: string) => {
    if (!interests || interests.length === 0) return false;
    const textToSearch = `${title} ${desc || ''}`.toLowerCase();
    return interests.some(interest => {
      const keywords = CATEGORY_KEYWORDS[interest];
      if (!keywords) return false;
      return keywords.some(kw => textToSearch.includes(kw.toLowerCase()));
    });
  }, [interests]);

  const filteredItems = items.filter((item) => showRead || !readUrls.has(getCleanUrl(item.link)));

  // Reset visible count when items change (new feeds loaded)
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [items]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredItems.length));
  }, [filteredItems.length]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredItems.length) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, filteredItems.length, loadMore]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest">
          Latest News
        </h2>
        <button
          onClick={() => setShowRead(!showRead)}
          className="flex items-center gap-2 text-xs font-medium text-white/40 hover:text-white/80 transition-colors"
          title={showRead ? "Hide read articles" : "Show read articles"}
        >
          {showRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showRead ? "Hide Read" : "Show Read"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400/70 mb-4">
          Could not load some feeds. Check your URLs in settings.
        </p>
      )}

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <motion.div key={`skeleton-${i}`} layout exit={{ opacity: 0 }}>
                  <SkeletonCard />
                </motion.div>
              ))
            : visibleItems.map((item) => (
                <motion.div
                  key={item.link}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
                  transition={{ duration: 0.3, type: 'spring', bounce: 0.15 }}
                >
                  <NewsCard 
                    item={item} 
                    isRead={readUrls.has(getCleanUrl(item.link))} 
                    isRecommended={checkIsRecommended(item.title, item.description)}
                    onClick={() => markAsRead(item.link)} 
                    onDismiss={() => markAsRead(item.link)}
                  />
                </motion.div>
              ))}
        </AnimatePresence>
      </motion.div>

      {/* Infinite scroll sentinel */}
      {!loading && hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse [animation-delay:150ms]" />
            <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse [animation-delay:300ms]" />
          </div>
        </div>
      )}

      {!loading && filteredItems.length === 0 && !error && (
        <p className="text-sm text-white/30 text-center py-8">
          {items.length === 0 ? "No articles found. Add RSS feed URLs in settings." : "No unread articles."}
        </p>
      )}
    </div>
  );
}
