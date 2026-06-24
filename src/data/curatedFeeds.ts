export interface CuratedFeed {
  name: string;
  domain: string;
  category: string;
  feedUrl: string;
}

export const CURATED_FEEDS: CuratedFeed[] = [
  // Technology
  { name: 'TechCrunch', domain: 'techcrunch.com', category: 'Technology', feedUrl: 'https://techcrunch.com/feed/' },
  { name: 'Engadget', domain: 'engadget.com', category: 'Technology', feedUrl: 'https://www.engadget.com/rss.xml' },
  { name: 'The Verge', domain: 'theverge.com', category: 'Technology', feedUrl: 'https://www.theverge.com/rss/index.xml' },
  { name: 'Wired', domain: 'wired.com', category: 'Technology', feedUrl: 'https://www.wired.com/feed/rss' },
  { name: 'Dev.to', domain: 'dev.to', category: 'Technology', feedUrl: 'https://dev.to/feed' },
  { name: 'Hacker News', domain: 'news.ycombinator.com', category: 'Technology', feedUrl: 'https://news.ycombinator.com/rss' },
  { name: 'Gizmodo', domain: 'gizmodo.com', category: 'Technology', feedUrl: 'https://gizmodo.com/rss' },
  { name: 'TechRadar', domain: 'techradar.com', category: 'Technology', feedUrl: 'https://www.techradar.com/rss' },

  // Gaming
  { name: 'IGN', domain: 'ign.com', category: 'Gaming', feedUrl: 'https://feeds.feedburner.com/ign/news' },
  { name: 'Kotaku', domain: 'kotaku.com', category: 'Gaming', feedUrl: 'https://kotaku.com/rss' },
  { name: 'PC Gamer', domain: 'pcgamer.com', category: 'Gaming', feedUrl: 'https://www.pcgamer.com/rss/' },

  // Finance & Business
  { name: 'CNBC Finance', domain: 'cnbc.com', category: 'Finance', feedUrl: 'https://search.cnbc.com/rs/search/view.xml?partnerId=2000&keywords=finance' },
  { name: 'Bloomberg', domain: 'bloomberg.com', category: 'Finance', feedUrl: 'https://www.bloomberg.com/feed/bline/' },
  { name: 'WSJ Markets', domain: 'wsj.com', category: 'Finance', feedUrl: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml' },

  // Science & Space
  { name: 'NASA Breaking News', domain: 'nasa.gov', category: 'Science', feedUrl: 'https://www.nasa.gov/feed/' },
  { name: 'Phys.org', domain: 'phys.org', category: 'Science', feedUrl: 'https://phys.org/rss-feed/' },
  { name: 'Space.com', domain: 'space.com', category: 'Science', feedUrl: 'https://www.space.com/feeds/all' },

  // General News
  { name: 'BBC News', domain: 'bbc.com', category: 'News', feedUrl: 'https://feeds.bbci.co.uk/news/rss.xml' },
  { name: 'CNN Top Stories', domain: 'cnn.com', category: 'News', feedUrl: 'https://rss.cnn.com/rss/cnn_topstories.rss' },
  { name: 'NYT Home Page', domain: 'nytimes.com', category: 'News', feedUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml' },
  { name: 'Reuters', domain: 'reuters.com', category: 'News', feedUrl: 'https://www.reutersagency.com/feed/' },

  // Sports
  { name: 'ESPN News', domain: 'espn.com', category: 'Sports', feedUrl: 'https://www.espn.com/espn/rss/news' },
  { name: 'Sports Illustrated', domain: 'si.com', category: 'Sports', feedUrl: 'https://www.si.com/.rss/full/' },
];

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Technology: ['programming', 'coding', 'software', 'developer', 'javascript', 'typescript', 'react', 'github', 'python', 'ai', 'gpt', 'llm', 'copilot', 'machine learning', 'tech', 'apple', 'google', 'microsoft', 'android', 'ios', 'cybersecurity', 'hacker', 'web dev', 'cloud', 'aws'],
  Gaming: ['game', 'gaming', 'playstation', 'xbox', 'nintendo', 'switch', 'steam', 'valve', 'rpg', 'mmo', 'fps', 'fortnite', 'minecraft', 'zelda', 'gamer', 'console', 'pc gamer', 'kotaku', 'ign'],
  Finance: ['stock', 'stocks', 'market', 'investing', 'crypto', 'bitcoin', 'ethereum', 'finance', 'economy', 'nasdaq', 'dow jones', 'portfolio', 'dividend', 'inflation', 'trading', 'sec', 'fed'],
  Science: ['space', 'nasa', 'mars', 'physics', 'astronomy', 'quantum', 'science', 'biology', 'climate', 'fusion', 'evolution', 'nature', 'telescope', 'spacex'],
  News: ['politics', 'government', 'election', 'court', 'senate', 'president', 'global', 'world news', 'war', 'treaty', 'local', 'breaking news'],
  Sports: ['nfl', 'nba', 'mlb', 'soccer', 'football', 'basketball', 'baseball', 'olympics', 'cup', 'espn', 'athlete', 'coach', 'tournament', 'championship'],
};
