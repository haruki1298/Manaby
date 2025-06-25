import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import i18n from '../../lib/i18n';
import { authRepository } from '../auth/auath.repository';
import { noteRepository } from '../notes/note.repository';
import { useCurrentUserStore } from '../auth/current-user.state';

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
  setDisplayName: (name: string) => Promise<void>;
  setBio: (bio: string) => void;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const currentUserStore = useCurrentUserStore();

  // ローカルストレージから設定を読み込み
  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = localStorage.getItem('settings-storage');
      const savedLanguage = localStorage.getItem('app-language');
      let languageToSet = defaultSettings.defaultLanguage;
      
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          let newSettings = { ...defaultSettings, ...parsed };
          
          // 現在のユーザー情報から表示名を初期化（または更新）
          if (currentUserStore.currentUser?.user_metadata?.name) {
            newSettings.displayName = currentUserStore.currentUser.user_metadata.name;
          }
          
          setSettings(newSettings);
          languageToSet = newSettings.defaultLanguage;
        } catch (error) {
          console.error('Failed to load settings:', error);
        }
      } else {
        // 初回起動時：現在のユーザー情報から表示名を設定
        if (currentUserStore.currentUser?.user_metadata?.name) {
          setSettings(prev => ({
            ...prev,
            displayName: currentUserStore.currentUser!.user_metadata.name
          }));
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
  }, [currentUserStore.currentUser]);

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

  const setDisplayName = async (name: string) => {
    console.log('setDisplayName called with:', name);
    
    try {
      // まずSupabaseのユーザー情報を更新
      const updatedUser = await authRepository.updateUserDisplayName(name);
      console.log('Updated user received:', updatedUser);
      if (updatedUser && currentUserStore.currentUser) {
        currentUserStore.updateUser(updatedUser);
        console.log('User store updated');
        
        // ユーザーが作成した全ノートの作者名も更新
        try {
          await noteRepository.updateCreatorNameByUserId(currentUserStore.currentUser.id, name);
          console.log('Creator names updated successfully');
        } catch (noteUpdateError) {
          console.error('Failed to update creator names in notes:', noteUpdateError);
          // ノート更新に失敗してもユーザー情報の更新は成功したのでエラーは投げない
        }
        
        // Supabase更新成功後にローカル設定を更新
        updateSettings({ displayName: name });
        console.log('Settings updated with displayName:', name);
      }
    } catch (error) {
      console.error('Failed to update user display name:', error);
      
      // セッション切れの場合、セッション更新を試行
      if (error instanceof Error && error.message === 'SESSION_EXPIRED') {
        try {
          console.log('Attempting to refresh session...');
          await authRepository.refreshSession();
          
          // セッション更新後、再度表示名更新を試行
          const updatedUser = await authRepository.updateUserDisplayName(name);
          if (updatedUser && currentUserStore.currentUser) {
            currentUserStore.updateUser(updatedUser);
            
            // ノートの作者名も更新
            try {
              await noteRepository.updateCreatorNameByUserId(currentUserStore.currentUser.id, name);
              console.log('Creator names updated after session refresh');
            } catch (noteUpdateError) {
              console.error('Failed to update creator names after session refresh:', noteUpdateError);
            }
            
            updateSettings({ displayName: name });
            console.log('Display name updated after session refresh');
            return; // 成功したのでエラーを投げない
          }
        } catch (refreshError) {
          console.error('Failed to refresh session:', refreshError);
          // セッション更新も失敗した場合は元のエラーを投げる
          throw error;
        }
      }
      
      throw error; // エラーを上位に伝播
    }
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