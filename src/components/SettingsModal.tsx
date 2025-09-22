import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  X,
  Moon,
  Sun,
  Monitor,
  Bell,
  BellOff,
  Eye,
  Share2,
  Image,
  ImageOff,
  RefreshCw,
  Clock,
  Newspaper,
  Globe,
  Home,
  Info
} from 'lucide-react';
import { Settings } from '../types/news';
import pkg from '../../package.json';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export function SettingsModal({ isOpen: _isOpen, onClose, settings, onSettingsChange }: SettingsModalProps) {
  const { t, i18n } = useTranslation();

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    onSettingsChange({ ...settings, theme });
  };

  const SettingToggle = ({ 
    checked, 
    onChange, 
    label, 
    icon: Icon,
    offIcon: OffIcon,
    description 
  }: { 
    checked: boolean; 
    onChange: (value: boolean) => void; 
    label: string;
    icon: any;
    offIcon: any;
    description: string;
  }) => (
    <div className="flex items-start space-x-4 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
      <div className="flex-shrink-0 mt-1">
        {checked ? (
          <Icon className="h-6 w-6 text-primary" />
        ) : (
          <OffIcon className="h-6 w-6 text-secondary" />
        )}
      </div>
      <div className="flex-grow">
        <label className="flex items-center justify-between">
          <div>
            <span className="font-medium">{label}</span>
            <p className="text-sm text-secondary mt-1">{description}</p>
          </div>
          <div className="relative inline-block w-12 h-6 flex-shrink-0">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span className="absolute inset-0 bg-secondary/20 peer-checked:bg-primary rounded-full transition-colors cursor-pointer" />
            <span className="absolute inset-y-1 start-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:start-7" />
          </div>
        </label>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full h-full md:max-w-3xl md:rounded-3xl md:max-h-[90vh] bg-gradient-to-br from-surface via-surface to-background/50 md:border border-border/20 shadow-2xl backdrop-blur-xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-8 pb-3 md:pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Newspaper className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold">
                {t('settings.title')}
              </h2>
              <p className="text-secondary mt-1">{t('settings.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-primary/10 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>


        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4 md:pb-8">
          <div className="space-y-10">

          {/* Display Settings */}
          <section className="bg-background/30 rounded-xl p-4 md:p-6 border border-border/10">
            <h3 className="text-xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              {t('settings.sections.theme')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                  settings.theme === 'light'
                    ? 'bg-primary text-white border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Sun className="h-5 w-5" />
                <span>{t('settings.theme.light')}</span>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-primary text-white border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Moon className="h-5 w-5" />
                <span>{t('settings.theme.dark')}</span>
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                  settings.theme === 'system'
                    ? 'bg-primary text-white border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Monitor className="h-5 w-5" />
                <span>{t('settings.theme.system')}</span>
              </button>
            </div>
          </section>
          <section className="bg-background/30 rounded-xl p-4 md:p-6 border border-border/10">
            <h3 className="text-xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              {t('settings.sections.display')}
            </h3>
            <div className="space-y-4">
              <SettingToggle
                checked={settings.showThumbnails}
                onChange={(value) => onSettingsChange({ ...settings, showThumbnails: value })}
                label={t('settings.display.showThumbnails.label')}
                icon={Image}
                offIcon={ImageOff}
                description={t('settings.display.showThumbnails.description')}
              />
              <SettingToggle
                checked={settings.showReadingTime}
                onChange={(value) => onSettingsChange({ ...settings, showReadingTime: value })}
                label={t('settings.display.readingTime.label')}
                icon={Clock}
                offIcon={Clock}
                description={t('settings.display.readingTime.description')}
              />
              <div className="p-4 rounded-lg bg-background/50">
                <label className="block text-sm font-medium mb-2">{t('settings.display.layoutDensity.label')}</label>
                <select
                  value={settings.articlesPerPage}
                  onChange={(e) => onSettingsChange({ ...settings, articlesPerPage: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2"
                >
                  <option value="12">{t('settings.display.layoutDensity.comfortable')}</option>
                  <option value="24">{t('settings.display.layoutDensity.balanced')}</option>
                  <option value="36">{t('settings.display.layoutDensity.compact')}</option>
                </select>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-background/30 rounded-xl p-4 md:p-6 border border-border/10">
            <h3 className="text-xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              {t('settings.sections.features')}
            </h3>
            <div className="space-y-4">
              <SettingToggle
                checked={settings.enableSocialShare}
                onChange={(value) => onSettingsChange({ ...settings, enableSocialShare: value })}
                label={t('settings.features.socialSharing.label')}
                icon={Share2}
                offIcon={Share2}
                description={t('settings.features.socialSharing.description')}
              />
              <SettingToggle
                checked={settings.autoRefresh}
                onChange={(value) => onSettingsChange({ ...settings, autoRefresh: value })}
                label={t('settings.features.autoRefresh.label')}
                icon={RefreshCw}
                offIcon={RefreshCw}
                description={t('settings.features.autoRefresh.description')}
              />
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-background/30 rounded-xl p-4 md:p-6 border border-border/10">
            <h3 className="text-xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              {t('settings.sections.notifications')}
            </h3>
            <div className="space-y-4">
              <SettingToggle
                checked={settings.notifications}
                onChange={(value) => onSettingsChange({ ...settings, notifications: value })}
                label={t('settings.notifications.pushNotifications.label')}
                icon={Bell}
                offIcon={BellOff}
                description={t('settings.notifications.pushNotifications.description')}
              />
            </div>
          </section>

          {/* Language */}
          <section className="bg-background/30 rounded-xl p-4 md:p-6 border border-border/10">
            <h3 className="text-xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              {t('settings.sections.language')}
            </h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-4 p-3 rounded-lg hover:bg-background/50 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value="en"
                  checked={settings.language === 'en'}
                  onChange={() => {
                    i18n.changeLanguage('en');
                    onSettingsChange({ ...settings, language: 'en' });
                  }}
                  className="w-4 h-4 text-primary border-border focus:ring-primary/20"
                />
                <span className="font-medium">{t('settings.language.english')}</span>
              </label>
              <label className="flex items-center space-x-4 p-3 rounded-lg hover:bg-background/50 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value="np"
                  checked={settings.language === 'np'}
                  onChange={() => {
                    i18n.changeLanguage('np');
                    onSettingsChange({ ...settings, language: 'np' });
                  }}
                  className="w-4 h-4 text-primary border-border focus:ring-primary/20"
                />
                <span className="font-medium">{t('settings.language.nepali')}</span>
              </label>
            </div>
          </section>

          {/* News Sources */}
          <section className="bg-background/30 rounded-xl p-4 md:p-6 border border-border/10">
            <h3 className="text-xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              {t('settings.sections.newsSources')}
            </h3>
            <div className="space-y-4">
              <SettingToggle
                checked={settings.newsSources.includes('international')}
                onChange={(value) => {
                  const newSources = value
                    ? [...settings.newsSources, 'international']
                    : settings.newsSources.filter(s => s !== 'international');
                  onSettingsChange({ ...settings, newsSources: newSources });
                }}
                label={t('settings.newsSources.international.label')}
                icon={Globe}
                offIcon={Globe}
                description={t('settings.newsSources.international.description')}
              />
              <SettingToggle
                checked={settings.newsSources.includes('domestic')}
                onChange={(value) => {
                  const newSources = value
                    ? [...settings.newsSources, 'domestic']
                    : settings.newsSources.filter(s => s !== 'domestic');
                  onSettingsChange({ ...settings, newsSources: newSources });
                }}
                label={t('settings.newsSources.nepali.label')}
                icon={Home}
                offIcon={Home}
                description={t('settings.newsSources.nepali.description')}
              />
            </div>
          </section>

          {/* About */}
          <section className="bg-background/30 rounded-xl p-4 md:p-6 border border-border/10">
            <h3 className="text-xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              About
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Version:</span>
                <span className="font-medium">{pkg.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Build Number:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Creator:</span>
                <span className="font-medium">{pkg.author}</span>
              </div>
            </div>
          </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}