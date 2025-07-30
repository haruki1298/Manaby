import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Settings, User, Moon, Sun, Palette, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/modules/settings/settings.state.tsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => Promise<void>;
}

export function SettingsModal({ isOpen, onClose, onLogout }: SettingsModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameUpdateMessage, setNameUpdateMessage] = useState<string | null>(null);
  const [tempDisplayName, setTempDisplayName] = useState('');
  
  const {
    settings,
    setAutoSave,
    setDefaultLanguage,
    setTheme,
    setFontSize,
    setDisplayName,
    setShowOnlySpecificUser,
    setSpecificUserName,
    setShowOnlyFavorites,
    setHidePublicNotes,
    setShowPublicNotesOnly,
    setShowOnlyRecentNotes,
    setRecentDaysLimit,
  } = useSettings();

  // 設定が変更されたときにtempDisplayNameを同期
  useEffect(() => {
    setTempDisplayName(settings.displayName || '');
  }, [settings.displayName]);

  // モーダルが開かれたときにも同期
  useEffect(() => {
    if (isOpen) {
      setTempDisplayName(settings.displayName || '');
      setNameUpdateMessage(null);
    }
  }, [isOpen, settings.displayName]);

  const handleDisplayNameSubmit = async () => {
    setIsUpdatingName(true);
    setNameUpdateMessage(null);
    
    try {
      await setDisplayName(tempDisplayName);
      setNameUpdateMessage(t('settings.displayName.notesUpdated'));
      setTimeout(() => setNameUpdateMessage(null), 3000);
    } catch (error) {
      console.error('Display name update error:', error);
      let errorMessage = t('settings.displayName.updateError');
      
      if (error instanceof Error) {
        if (error.message === 'SESSION_EXPIRED' || error.message.includes('Auth session missing')) {
          errorMessage = t('settings.displayName.sessionExpired');
        } else if (error.message === 'NO_SESSION') {
          errorMessage = t('settings.displayName.noSession');
        } else if (error.message === 'REFRESH_FAILED') {
          errorMessage = t('settings.displayName.sessionExpired');
        }
      }
      
      setNameUpdateMessage(errorMessage);
      setTimeout(() => setNameUpdateMessage(null), 5000);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const isDisplayNameChanged = tempDisplayName !== settings.displayName;

  const tabs = [
    { id: 'general', label: t('settings.general'), icon: Settings },
    { id: 'account', label: t('settings.account'), icon: User },
    { id: 'appearance', label: t('settings.appearance'), icon: Palette },
    { id: 'filter', label: t('settings.filter', 'フィルター'), icon: Filter },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                {t('settings.general.title')}
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg space-y-3 sm:space-y-0 border border-neutral-200 dark:border-neutral-700">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {t('settings.autoSave')}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-300">
                      {t('settings.autoSave.description')}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 self-start sm:self-auto"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg space-y-3 sm:space-y-0 border border-neutral-200 dark:border-neutral-700">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {t('settings.defaultLanguage')}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-300">
                      {t('settings.defaultLanguage.description')}
                    </p>
                  </div>
                  <select 
                    value={settings.defaultLanguage}
                    onChange={(e) => {
                      setDefaultLanguage(e.target.value);
                    }}
                    className="w-full sm:w-auto px-3 py-1 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value="ja">{t('language.ja')}</option>
                    <option value="en">{t('language.en')}</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* ログアウトセクション */}
            {onLogout && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  {t('auth.session', 'セッション')}
                </h3>
                <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {t('auth.logout', 'ログアウト')}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-300">
                        {t('auth.logout.description', 'アカウントからログアウトします')}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        await onLogout();
                        onClose();
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors duration-150"
                    >
                      {t('auth.logout', 'ログアウト')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                {t('settings.account.title')}
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <p className="font-medium text-neutral-900 dark:text-white mb-2">
                    {t('settings.profile')}
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        {t('settings.displayName')}
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={tempDisplayName}
                          onChange={(e) => setTempDisplayName(e.target.value)}
                          placeholder={t('settings.displayName.placeholder')}
                          disabled={isUpdatingName}
                          className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                          onClick={handleDisplayNameSubmit}
                          disabled={isUpdatingName || !isDisplayNameChanged}
                          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white rounded-md transition-colors duration-150 font-medium"
                        >
                          {isUpdatingName ? t('common.loading') : t('common.save')}
                        </button>
                      </div>
                      {nameUpdateMessage && (
                        <p className={`text-sm mt-1 ${
                          nameUpdateMessage.includes('successfully') || nameUpdateMessage.includes('更新されました')
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {nameUpdateMessage}
                        </p>
                      )}
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
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                {t('settings.appearance.title')}
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <p className="font-medium text-neutral-900 dark:text-white mb-3">
                    {t('settings.theme')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <p className="font-medium text-neutral-900 dark:text-white mb-3">
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
      case 'filter':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                {t('settings.filter.title', 'フィルター設定')}
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg space-y-3 sm:space-y-0 border border-neutral-200 dark:border-neutral-700">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {t('settings.showOnlySpecificUser', '特定ユーザのみ表示')}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-300">
                      {t('settings.showOnlySpecificUser.description', '指定したユーザ名のノートのみを表示します')}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showOnlySpecificUser}
                    onChange={(e) => setShowOnlySpecificUser(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 self-start sm:self-auto"
                  />
                </div>
                {settings.showOnlySpecificUser && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg space-y-3 sm:space-y-0 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {t('settings.specificUserName', 'ユーザ名')}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-300">
                        {t('settings.specificUserName.description', '表示したいユーザ名を入力してください')}
                      </p>
                    </div>
                    <input
                      type="text"
                      value={settings.specificUserName}
                      onChange={(e) => setSpecificUserName(e.target.value)}
                      placeholder={t('settings.specificUserName.placeholder', 'ユーザ名を入力')}
                      className="w-full sm:w-auto px-3 py-1 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                    />
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg space-y-3 sm:space-y-0 border border-neutral-200 dark:border-neutral-700">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {t('settings.showOnlyFavorites', 'お気に入りのみ表示')}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-300">
                      {t('settings.showOnlyFavorites.description', 'お気に入りに登録されたノートのみを表示します')}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showOnlyFavorites}
                    onChange={(e) => setShowOnlyFavorites(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 self-start sm:self-auto"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg space-y-3 sm:space-y-0 border border-neutral-200 dark:border-neutral-700">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {t('settings.hidePublicNotes', '公開ノートを非表示')}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-300">
                      {t('settings.hidePublicNotes.description', '公開されているノートを非表示にします')}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.hidePublicNotes}
                    onChange={(e) => setHidePublicNotes(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 self-start sm:self-auto"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg space-y-3 sm:space-y-0 border border-neutral-200 dark:border-neutral-700">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {t('settings.showPublicNotesOnly', '公開ノートのみ表示')}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-300">
                      {t('settings.showPublicNotesOnly.description', '公開されているノートのみを表示します')}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showPublicNotesOnly || false}
                    onChange={(e) => setShowPublicNotesOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 self-start sm:self-auto"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg space-y-3 sm:space-y-0 border border-neutral-200 dark:border-neutral-700">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {t('settings.showOnlyRecentNotes', '最近のノートのみ表示')}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-300">
                      {t('settings.showOnlyRecentNotes.description', '指定した日数以内に作成・更新されたノートのみを表示します')}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showOnlyRecentNotes}
                    onChange={(e) => setShowOnlyRecentNotes(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 self-start sm:self-auto"
                  />
                </div>

                {settings.showOnlyRecentNotes && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg space-y-3 sm:space-y-0 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {t('settings.recentDaysLimit', '日数制限')}: {settings.recentDaysLimit}日
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-300">
                        {t('settings.recentDaysLimit.description', '何日以内のノートを表示するかを設定してください')}
                      </p>
                    </div>
                    <div className="w-full sm:w-auto">
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={settings.recentDaysLimit}
                        onChange={(e) => setRecentDaysLimit(Number(e.target.value))}
                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        <span>1日</span>
                        <span>30日</span>
                      </div>
                    </div>
                  </div>
                )}
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
      <DialogContent className="max-w-4xl h-[80vh] md:h-[80vh] w-[95vw] md:w-full p-0 bg-white dark:bg-neutral-800">
        <div className="flex flex-col md:flex-row h-full">
          {/* サイドバー - モバイルでは上部、デスクトップでは左側 */}
          <div className="w-full md:w-64 bg-white dark:bg-neutral-800 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-700">
            <DialogHeader className="p-4 md:p-6 border-b border-neutral-200 dark:border-neutral-700">
              <DialogTitle className="flex items-center gap-x-2 text-lg font-semibold">
                <Settings className="w-5 h-5" />
                {t('settings.title')}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t('settings.description')}
              </DialogDescription>
            </DialogHeader>
            <nav className="p-2 md:p-4">
              {/* モバイル: 横スクロール可能なタブ, デスクトップ: 縦並び */}
              <div className="flex md:flex-col space-x-1 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-x-visible">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex-shrink-0 md:flex-shrink flex items-center gap-x-2 md:gap-x-3 px-3 py-2 text-left rounded-lg transition-colors duration-150 whitespace-nowrap md:w-full
                      ${
                        activeTab === tab.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                      }
                    `}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-sm md:text-base">{tab.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
