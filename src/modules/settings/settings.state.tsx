import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import i18n from '../../lib/i18n';

export type Theme = 'light' | 'dark' | 'system';

interface SettingsState {
  autoSave: boolean;
  defaultLanguage: string;
  theme: Theme;
  fontSize: number;
  defaultNoteVisibility: 'private' | 'public';
  displayName: string;
  bio: string;
}

const defaultSettings: SettingsState = {
  autoSave: true,
  defaultLanguage: 'ja',
  theme: 'system',
  fontSize: 14,
  defaultNoteVisibility: 'private',
  displayName: '',
  bio: '',
};

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  setAutoSave: (enabled: boolean) => void;
  setDefaultLanguage: (language: string) => Promise<void>;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  setDefaultNoteVisibility: (visibility: 'private' | 'public') => void;
  setDisplayName: (name: string) => void;
  setBio: (bio: string) => void;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  // ローカルストレージから設定を読み込み
  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = localStorage.getItem('settings-storage');
      const savedLanguage = localStorage.getItem('app-language');
      let languageToSet = defaultSettings.defaultLanguage;
      
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          const newSettings = { ...defaultSettings, ...parsed };
          setSettings(newSettings);
          languageToSet = newSettings.defaultLanguage;
        } catch (error) {
          console.error('Failed to load settings:', error);
        }
      }
      
      // 専用の言語キーがある場合はそれを優先
      if (savedLanguage) {
        languageToSet = savedLanguage;
      }
      
      // 言語を設定（i18nとローカルストレージの両方）
      await i18n.changeLanguage(languageToSet);
      localStorage.setItem('app-language', languageToSet);
      
      // 設定の言語も更新
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.defaultLanguage !== languageToSet) {
          const updatedSettings = { ...parsed, defaultLanguage: languageToSet };
          setSettings(updatedSettings);
          localStorage.setItem('settings-storage', JSON.stringify(updatedSettings));
        }
      }
    };

    loadSettings();
  }, []);

  // 設定変更時にローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('settings-storage', JSON.stringify(settings));
    applyTheme(settings.theme);
    applyFontSize(settings.fontSize);
  }, [settings]);

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const setAutoSave = (enabled: boolean) => {
    updateSettings({ autoSave: enabled });
  };

  const setDefaultLanguage = async (language: string) => {
    updateSettings({ defaultLanguage: language });
    // i18nの言語も同時に更新
    await i18n.changeLanguage(language);
    // 専用のキーで言語を保存
    localStorage.setItem('app-language', language);
  };

  const setTheme = (theme: Theme) => {
    updateSettings({ theme });
  };

  const setFontSize = (size: number) => {
    updateSettings({ fontSize: size });
  };

  const setDefaultNoteVisibility = (visibility: 'private' | 'public') => {
    updateSettings({ defaultNoteVisibility: visibility });
  };

  const setDisplayName = (name: string) => {
    updateSettings({ displayName: name });
  };

  const setBio = (bio: string) => {
    updateSettings({ bio });
  };

  const resetSettings = async () => {
    setSettings(defaultSettings);
    // i18nもデフォルト言語にリセット
    await i18n.changeLanguage(defaultSettings.defaultLanguage);
    localStorage.setItem('app-language', defaultSettings.defaultLanguage);
  };

  const value: SettingsContextType = {
    settings,
    updateSettings,
    setAutoSave,
    setDefaultLanguage,
    setTheme,
    setFontSize,
    setDefaultNoteVisibility,
    setDisplayName,
    setBio,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// テーマを適用する関数
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.toggle('dark', systemTheme === 'dark');
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

// フォントサイズを適用する関数
function applyFontSize(size: number) {
  const root = document.documentElement;
  root.style.setProperty('--font-size-base', `${size}px`);
}