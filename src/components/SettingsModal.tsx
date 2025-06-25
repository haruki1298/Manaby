import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Settings, User, Moon, Sun, Shield, Palette } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/modules/settings/settings.state.tsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const {
    settings,
    setAutoSave,
    setDefaultLanguage,
    setTheme,
    setFontSize,
    setDefaultNoteVisibility,
    setDisplayName,
    setBio,
    resetSettings,
  } = useSettings();

  const tabs = [
    { id: 'general', label: t('settings.general'), icon: Settings },
    { id: 'account', label: t('settings.account'), icon: User },
    { id: 'appearance', label: t('settings.appearance'), icon: Palette },
    { id: 'privacy', label: t('settings.privacy'), icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                {t('settings.general.title')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {t('settings.autoSave')}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {t('settings.autoSave.description')}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {t('settings.defaultLanguage')}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {t('settings.defaultLanguage.description')}
                    </p>
                  </div>
                  <select 
                    value={settings.defaultLanguage}
                    onChange={(e) => {
                      setDefaultLanguage(e.target.value);
                    }}
                    className="px-3 py-1 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="ja">{t('language.ja')}</option>
                    <option value="en">{t('language.en')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                {t('settings.account.title')}
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    {t('settings.profile')}
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        {t('settings.displayName')}
                      </label>
                      <input
                        type="text"
                        value={settings.displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={t('settings.displayName.placeholder')}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        {t('settings.bio')}
                      </label>
                      <textarea
                        value={settings.bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder={t('settings.bio.placeholder')}
                        rows={3}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                {t('settings.appearance.title')}
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                    {t('settings.theme')}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div 
                      className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        settings.theme === 'light' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400'
                      }`}
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="w-6 h-6 text-yellow-500 mb-2" />
                      <span className="text-sm font-medium">{t('settings.theme.light')}</span>
                    </div>
                    <div 
                      className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        settings.theme === 'dark' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400'
                      }`}
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="w-6 h-6 text-blue-500 mb-2" />
                      <span className="text-sm font-medium">{t('settings.theme.dark')}</span>
                    </div>
                    <div 
                      className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        settings.theme === 'system' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400'
                      }`}
                      onClick={() => setTheme('system')}
                    >
                      <Settings className="w-6 h-6 text-neutral-500 mb-2" />
                      <span className="text-sm font-medium">{t('settings.theme.system')}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                    {t('settings.fontSize')}: {settings.fontSize}px
                  </p>
                  <input
                    type="range"
                    min="12"
                    max="20"
                    value={settings.fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    <span>{t('settings.fontSize.small')}</span>
                    <span>{t('settings.fontSize.large')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                {t('settings.privacy.title')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {t('settings.defaultNoteVisibility')}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {t('settings.defaultNoteVisibility.description')}
                    </p>
                  </div>
                  <select 
                    value={settings.defaultNoteVisibility}
                    onChange={(e) => setDefaultNoteVisibility(e.target.value as 'private' | 'public')}
                    className="px-3 py-1 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="private">{t('settings.visibility.private')}</option>
                    <option value="public">{t('settings.visibility.public')}</option>
                  </select>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                    {t('settings.dangerZone')}
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                    {t('settings.dangerZone.description')}
                  </p>
                  <div className="space-y-2">
                    <button 
                      onClick={async () => {
                        if (confirm(t('settings.resetConfirm'))) {
                          await resetSettings();
                        }
                      }}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium transition-colors duration-150 mr-2"
                    >
                      {t('settings.resetSettings')}
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(t('settings.deleteConfirm'))) {
                          alert(t('settings.deleteNotImplemented'));
                        }
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors duration-150"
                    >
                      {t('settings.deleteAllData')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <div className="flex h-full">
          {/* サイドバー */}
          <div className="w-64 bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700">
            <DialogHeader className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <DialogTitle className="flex items-center gap-x-2 text-lg font-semibold">
                <Settings className="w-5 h-5" />
                {t('settings.title')}
              </DialogTitle>
            </DialogHeader>
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-x-3 px-3 py-2 text-left rounded-lg transition-colors duration-150
                    ${
                      activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
