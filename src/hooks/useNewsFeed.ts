import { useState, useEffect, useCallback, useRef } from 'react';
import { Article, Settings, FeedUrls } from '../types/news';
import { useInView } from 'react-intersection-observer';

const DEFAULT_SETTINGS: Settings = {
  newsSources: ['international'],
  articlesPerPage: 12,
  language: 'en',
  contentLanguage: 'en',
  notifications: true,
  autoRefresh: false,
  refreshInterval: 300000,
  showReadingTime: true,
  enableSocialShare: true,
  showThumbnails: true,
  hasSeenWelcome: true,
  theme: 'system'
};

const FEED_URLS: FeedUrls = {
  international: {
    all: [
      'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
      'https://feeds.feedburner.com/TechCrunch',
      'https://www.thenation.com/subject/politics/feed/',
      'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml',
      'https://variety.com/feed/',
      'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml'
    ],
    World: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    Technology: 'https://feeds.feedburner.com/TechCrunch',
    Politics: 'https://www.thenation.com/subject/politics/feed/',
    Sports: 'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml',
    Entertainment: 'https://variety.com/feed/',
    Health: 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml'
  },
  domestic: {
    all: [
      'https://english.onlinekhabar.com/feed',
      'https://english.onlinekhabar.com/category/political/feed',
      'https://techpana.com/feed/',
      'https://www.nepalisansar.com/entertainment/feed/',
      'https://swasthyakhabar.com/feed/'
    ],
    World: 'https://english.onlinekhabar.com/feed',
    Politics: 'https://english.onlinekhabar.com/category/political/feed',
    Technology: 'https://techpana.com/feed/',
    Sports: 'https://english.onlinekhabar.com/category/sports/feed',
    Entertainment: 'https://www.nepalisansar.com/entertainment/feed/',
    Health: 'https://swasthyakhabar.com/feed/'
  }
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useNewsFeed = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('newsSettings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [cache, setCache] = useState<{[key: string]: { data: Article[], timestamp: number }}>({});
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>(() => {
    const saved = localStorage.getItem('bookmarkedArticles');
    return saved ? JSON.parse(saved) : [];
  });
  const [readLaterArticles, setReadLaterArticles] = useState<string[]>(() => {
    const saved = localStorage.getItem('readLaterArticles');
    return saved ? JSON.parse(saved) : [];
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const { ref: infiniteScrollRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true
  });

  const saveSettings = useCallback((newSettings: Settings) => {
    const mergedSettings = { ...DEFAULT_SETTINGS, ...newSettings };
    localStorage.setItem('newsSettings', JSON.stringify(mergedSettings));
    setSettings(mergedSettings);

    // Apply theme immediately when changed
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let theme = mergedSettings.theme;
    if (theme === 'system') {
      theme = prefersDark ? 'dark' : 'light';
    }
    
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, []);

  const toggleBookmark = useCallback((articleId: string) => {
    setBookmarkedArticles(prev => {
      const newBookmarks = prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId];
      localStorage.setItem('bookmarkedArticles', JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  }, []);

  const toggleReadLater = useCallback((articleId: string) => {
    setReadLaterArticles(prev => {
      const newReadLater = prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId];
      localStorage.setItem('readLaterArticles', JSON.stringify(newReadLater));
      return newReadLater;
    });
  }, []);

  const loadNews = useCallback(async (category: string, append = false) => {
    try {
      const cacheKey = `${category}-${settings.newsSources.join(',')}-${settings.language}-${settings.contentLanguage}`;
      const now = Date.now();
      const cached = cache[cacheKey];

      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        let filteredArticles = cached.data;
        if (searchQuery) {
          filteredArticles = filteredArticles.filter(article =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        const start = (currentPage - 1) * settings.articlesPerPage;
        const end = start + settings.articlesPerPage;
        
        const paginatedArticles = filteredArticles.slice(start, end).map(article => ({
          ...article,
          isBookmarked: bookmarkedArticles.includes(article.id),
          isReadLater: readLaterArticles.includes(article.id)
        }));
        
        setArticles(prev => append ? [...prev, ...paginatedArticles] : paginatedArticles);
        return;
      }

      setIsLoading(true);
      setError(null);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const feeds = category === 'all'
        ? settings.newsSources.flatMap(source => FEED_URLS[source].all)
        : settings.newsSources.map(source => FEED_URLS[source][category]).flat();

      const apiKey = '9yafqwvbnwucsmlqmlb8mk1opqhbvivdvp6qlmqz';
      const results = await Promise.allSettled(
        feeds.map(feed =>
          fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}&api_key=${apiKey}`, {
            signal: controller.signal
          })
            .then(async res => {
              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }
              return res.json();
            })
            .catch(error => {
              if (error.name === 'AbortError') {
                throw error;
              }
              console.error(`Failed to fetch ${feed}:`, error);
              return { status: 'error', items: [] };
            })
        )
      );

      if (controller.signal.aborted) {
        return;
      }

      let allArticles = results
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value.status === 'ok')
        .flatMap(result => 
          result.value.items.map((item: any) => ({
            ...item,
            id: `${item.guid || item.link}`,
            source: result.value.feed?.title || 'Unknown Source',
            thumbnail: item.thumbnail || item.enclosure?.link || null,
            isBookmarked: bookmarkedArticles.includes(`${item.guid || item.link}`),
            isReadLater: readLaterArticles.includes(`${item.guid || item.link}`)
          }))
        );

      setCache(prev => ({
        ...prev,
        [cacheKey]: { data: allArticles, timestamp: now }
      }));

      if (searchQuery) {
        allArticles = allArticles.filter(article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

      const start = (currentPage - 1) * settings.articlesPerPage;
      const end = start + settings.articlesPerPage;
      const paginatedArticles = allArticles.slice(start, end);

      if (!controller.signal.aborted) {
        setArticles(prev => append ? [...prev, ...paginatedArticles] : paginatedArticles);
      }
    } catch (err) {
      const error = err as Error;
      if (error.name !== 'AbortError') {
        setError('Failed to load some news feeds. Showing available articles.');
        console.error('Error loading news:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [settings, currentPage, searchQuery, cache, bookmarkedArticles, readLaterArticles]);

  // Initialize theme on mount
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let theme = settings.theme;
    if (theme === 'system') {
      theme = prefersDark ? 'dark' : 'light';
    }
    
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    loadNews(currentCategory);

    return () => {
      controller.abort();
    };
  }, [currentCategory, settings.newsSources, settings.language, settings.contentLanguage, searchQuery]);

  useEffect(() => {
    let interval: number;
    if (settings.autoRefresh) {
      interval = setInterval(() => {
        loadNews(currentCategory);
      }, settings.refreshInterval);
    }
    return () => clearInterval(interval);
  }, [settings.autoRefresh, settings.refreshInterval, currentCategory]);

  useEffect(() => {
    if (inView) {
      setCurrentPage(prev => prev + 1);
    }
  }, [inView]);

  return {
    articles,
    isLoading,
    error,
    settings,
    currentCategory,
    currentPage,
    searchQuery,
    setCurrentCategory,
    setCurrentPage,
    setSearchQuery,
    saveSettings,
    loadNews,
    toggleBookmark,
    toggleReadLater,
    infiniteScrollRef
  };
};