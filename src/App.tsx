import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNewsFeed } from './hooks/useNewsFeed';
import { Settings } from './types/news';
import { NewsCard } from './components/NewsCard';
import { SettingsModal } from './components/SettingsModal';
import { SetupWizard } from './components/SetupWizard';
import { 
  NewspaperIcon, 
  Search, 
  Settings as SettingsIcon, 
  Filter,
  RefreshCw,
  Globe,
  Home,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';

function App() {
  const { t, i18n } = useTranslation();
  const {
    articles,
    isLoading,
    error,
    settings,
    currentCategory,
    searchQuery,
    setCurrentCategory,
    setSearchQuery,
    saveSettings,
    loadNews,
    currentPage,
    setCurrentPage
  } = useNewsFeed();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(!localStorage.getItem('hasCompletedSetup'));

  // Apply theme on mount and when it changes
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    let theme = settings.theme;
    if (theme === 'system') {
      theme = prefersDark ? 'dark' : 'light';
    }

    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [settings.theme]);

  // Apply language on mount and when it changes
  useEffect(() => {
    i18n.changeLanguage(settings.language);
  }, [settings.language, i18n]);

  const handleSettingsChange = (newSettings: Settings) => {
    saveSettings(newSettings);
  };

  const handleSetupComplete = (newSettings: Settings) => {
    saveSettings(newSettings);
    localStorage.setItem('hasCompletedSetup', 'true');
    setShowSetupWizard(false);
  };

  const handleRefresh = async () => {
    await loadNews(currentCategory);
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setCurrentPage(prev => prev + 1);
    await loadNews(currentCategory, true);
    setIsLoadingMore(false);
  };

  const handleLanguageToggle = () => {
    const newLanguage = settings.language === 'en' ? 'np' : 'en';
    i18n.changeLanguage(newLanguage);
    saveSettings({ ...settings, language: newLanguage });
  };

  const handleSourceToggle = (source: string) => {
    const newSources = settings.newsSources.includes(source)
      ? settings.newsSources.filter(s => s !== source)
      : [...settings.newsSources, source];
    
    if (newSources.length > 0) {
      saveSettings({ ...settings, newsSources: newSources });
    }
  };

  const handleThemeToggle = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    saveSettings({ ...settings, theme: newTheme });
  };

  return (
    <div className="min-h-screen bg-background text-primary transition-colors duration-200">
      {/* Setup Wizard */}
      <SetupWizard
        isOpen={showSetupWizard}
        onClose={() => setShowSetupWizard(false)}
        onComplete={handleSetupComplete}
        initialSettings={settings}
      />

    

      {/* Header */}
      <header className="sticky top-0 z-40">
        <div className="bg-surface/80 backdrop-blur-lg border-b border-border/10 shadow-sm">
          <div className="container mx-auto">
            <div className="flex items-center justify-between h-16 px-4">
              {/* Left Section */}
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-3"
                >
                  <NewspaperIcon className="h-8 w-8 text-primary" />
                  <h1 className="text-2xl font-display font-bold tracking-tight">YoNews</h1>
                </motion.div>

                {/* Language Controls */}
                <div className="hidden md:flex items-center gap-2 bg-background/50 p-1 rounded-full">
                  <button
                    onClick={handleLanguageToggle}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      settings.language === 'en'
                        ? 'bg-primary text-white'
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={handleLanguageToggle}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      settings.language === 'np'
                        ? 'bg-primary text-white'
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    नेपाली
                  </button>
                </div>

                {/* Source Toggle */}
                <div className="hidden md:flex items-center space-x-2">
                  <button
                    onClick={() => handleSourceToggle('international')}
                    className={`p-2 rounded-full transition-colors ${
                      settings.newsSources.includes('international')
                        ? 'bg-primary text-white'
                        : 'bg-surface hover:bg-primary/10'
                    }`}
                    title="International News"
                  >
                    <Globe className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleSourceToggle('domestic')}
                    className={`p-2 rounded-full transition-colors ${
                      settings.newsSources.includes('domestic')
                        ? 'bg-primary text-white'
                        : 'bg-surface hover:bg-primary/10'
                    }`}
                    title="Nepali News"
                  >
                    <Home className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Center Section - Search */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 max-w-xl mx-4"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-secondary" />
                  <input
                    type="text"
                    placeholder={settings.language === 'en' ? "Search news..." : "समाचार खोज्नुहोस्..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-full bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-primary placeholder-secondary transition-all duration-200"
                  />
                </div>
              </motion.div>

              {/* Right Section - Controls */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2"
              >
                <button
                  onClick={handleThemeToggle}
                  className="hidden md:flex p-2 rounded-full hover:bg-primary/10 transition-colors duration-200"
                  title={settings.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={settings.theme}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {settings.theme === 'light' ? (
                        <Moon className="h-5 w-5" />
                      ) : (
                        <Sun className="h-5 w-5" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-full hover:bg-primary/10 transition-colors duration-200"
                  title="Settings"
                >
                  <SettingsIcon className="h-5 w-5" />
                </button>
              </motion.div>
            </div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 px-4 py-3 overflow-x-auto scrollbar-hide"
            >
              {['all', 'world', 'technology', 'politics', 'sports', 'entertainment', 'health'].map(categoryKey => {
                const category = t(`settings.categories.${categoryKey}`);
                return (
                  <motion.button
                    key={categoryKey}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentCategory(category)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                      ${currentCategory === category
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-primary/10 hover:bg-primary/20 text-primary'}`}
                  >
                    {category}
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence>
          {isLoading && !isLoadingMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-8"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-error/10 border border-error/20 text-error p-6 rounded-xl mb-8"
            >
              {error}
            </motion.div>
          )}

          {!isLoading && articles.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <NewspaperIcon className="h-16 w-16 mx-auto text-secondary mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {settings.language === 'en' ? 'No articles found' : 'कुनै समाचार फेला परेन'}
              </h2>
              <p className="text-secondary">
                {settings.language === 'en' 
                  ? 'Try adjusting your search or filters'
                  : 'आफ्नो खोज वा फिल्टरहरू समायोजन गर्नुहोस्'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          layout
          className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1 max-w-3xl mx-auto'
          }`}
        >
          {articles.map((article, index) => (
            <NewsCard
              key={`${article.title}-${index}`}
              article={article}
              index={index}
              showReadingTime={settings.showReadingTime}
              enableSocialShare={settings.enableSocialShare}
              showThumbnails={settings.showThumbnails}
              language={settings.language}
              onBookmark={() => {}}
              onReadLater={() => {}}
            />
          ))}
        </motion.div>

        {/* Load More Button */}
        {articles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mt-12"
          >
            <motion.button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="group relative px-6 py-3 bg-primary text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2">
                {isLoadingMore ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                )}
                {isLoadingMore 
                  ? (settings.language === 'en' ? 'Loading...' : 'लोड हुँदैछ...')
                  : (settings.language === 'en' ? 'Load More' : 'थप लोड गर्नुहोस्')}
              </span>
            </motion.button>
          </motion.div>
        )}
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;