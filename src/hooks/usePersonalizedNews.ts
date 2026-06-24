import { useState, useEffect, useCallback } from 'react';
import { CURATED_FEEDS, CATEGORY_KEYWORDS, type CuratedFeed } from '../data/curatedFeeds';

const STORAGE_KEYS = {
  INTERESTS: 'horizon_personalized_interests',
  FEEDS: 'horizon_personalized_feeds',
  LAST_RUN: 'horizon_personalized_last_run',
};

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export function usePersonalizedNews(currentFeedUrls: string[]) {
  const [interests, setInterests] = useState<string[]>([]);
  const [recommendedFeeds, setRecommendedFeeds] = useState<CuratedFeed[]>([]);
  const [loading, setLoading] = useState(false);

  const runProfiling = useCallback(async () => {
    if (typeof chrome === 'undefined' || !chrome.history) {
      return;
    }

    setLoading(true);
    const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    chrome.history.search(
      {
        text: '',
        startTime: oneMonthAgo,
        maxResults: 1000,
      },
      async (historyItems) => {
        if (!historyItems || historyItems.length === 0) {
          setLoading(false);
          return;
        }

        let detectedCategories: string[] = [];

        // 1. Try built-in Gemini Nano AI
        try {
          const aiObj = (window as any).ai || (window as any).chrome?.aiOriginTrial || (window as any).model;
          if (aiObj && aiObj.languageModel) {
            const capabilities = await aiObj.languageModel.capabilities();
            if (capabilities && capabilities.available !== 'no') {
              const session = await aiObj.languageModel.create();
              // Get top 15 page titles for a concise yet representative list
              const sampleTitles = historyItems
                .filter(item => item.title && item.title.trim().length > 0)
                .slice(0, 20)
                .map(item => item.title);

              if (sampleTitles.length > 0) {
                const promptText = `Analyze these titles from the user's browsing history:
${sampleTitles.join('\n')}

Output a comma-separated list of the top 3 categories this user is interested in from these options: Technology, Gaming, Finance, Science, Sports, News. Do not include introductory text, numbers, markdown, or explanation. Only output the comma-separated categories.`;
                
                const response = await session.prompt(promptText);
                session.destroy?.();

                detectedCategories = response
                  .split(',')
                  .map((cat: string) => cat.trim())
                  .filter((cat: string) => Object.keys(CATEGORY_KEYWORDS).includes(cat));
              }
            }
          }
        } catch (e) {
          console.warn('Local Gemini Nano AI profiling failed or not enabled. Using local fallback.', e);
        }

        // 2. Local TF-IDF keyword extraction fallback
        if (detectedCategories.length === 0) {
          const scores: Record<string, number> = {
            Technology: 0,
            Gaming: 0,
            Finance: 0,
            Science: 0,
            News: 0,
            Sports: 0,
          };

          historyItems.forEach((item) => {
            const text = `${item.title || ''} ${item.url || ''}`.toLowerCase();
            const weight = item.visitCount || 1;

            for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
              keywords.forEach((keyword) => {
                if (text.includes(keyword.toLowerCase())) {
                  scores[category] += weight;
                }
              });
            }
          });

          detectedCategories = Object.entries(scores)
            .filter(([_, score]) => score > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([category]) => category)
            .slice(0, 3);
        }

        // 3. Make Feed Suggestions
        // Find domains user visited in history
        const visitedDomains = new Set<string>();
        historyItems.forEach((item) => {
          if (!item.url) return;
          try {
            const hostname = new URL(item.url).hostname.replace('www.', '');
            visitedDomains.add(hostname);
          } catch { /* ignore */ }
        });

        // Filter curated feeds based on:
        // A: User visited the domain, OR
        // B: The feed matches one of their top detected interest categories.
        // AND the user is not already subscribed to this feed URL.
        const suggestions = CURATED_FEEDS.filter((feed) => {
          const isAlreadySubscribed = currentFeedUrls.some(
            (url) => url.toLowerCase().trim() === feed.feedUrl.toLowerCase().trim()
          );
          if (isAlreadySubscribed) return false;

          const hasVisited = visitedDomains.has(feed.domain);
          const isInterestedCategory = detectedCategories.includes(feed.category);

          return hasVisited || isInterestedCategory;
        }).slice(0, 5); // Limit to top 5 suggestions

        // Update state and cache
        setInterests(detectedCategories);
        setRecommendedFeeds(suggestions);
        setLoading(false);

        try {
          localStorage.setItem(STORAGE_KEYS.INTERESTS, JSON.stringify(detectedCategories));
          localStorage.setItem(STORAGE_KEYS.FEEDS, JSON.stringify(suggestions));
          localStorage.setItem(STORAGE_KEYS.LAST_RUN, Date.now().toString());
        } catch { /* ignore */ }
      }
    );
  }, [currentFeedUrls]);

  // Load cached profile on mount
  useEffect(() => {
    try {
      const cachedInterests = localStorage.getItem(STORAGE_KEYS.INTERESTS);
      const cachedFeeds = localStorage.getItem(STORAGE_KEYS.FEEDS);
      const lastRun = localStorage.getItem(STORAGE_KEYS.LAST_RUN);

      if (cachedInterests && cachedFeeds && lastRun) {
        setInterests(JSON.parse(cachedInterests));
        setRecommendedFeeds(JSON.parse(cachedFeeds));

        const timeDiff = Date.now() - parseInt(lastRun, 10);
        if (timeDiff > CACHE_EXPIRY) {
          // Cache expired, trigger background profiling
          runProfiling();
        }
      } else {
        // No cache, trigger profiling
        runProfiling();
      }
    } catch {
      runProfiling();
    }
  }, [runProfiling]);

  return { interests, recommendedFeeds, loading, refreshProfiling: runProfiling };
}
