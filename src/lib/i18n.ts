import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 翻訳リソース
const resources = {
  ja: {
    translation: {
      // サイドバー
      "sidebar.newNote": "新しいノート",
      "sidebar.search": "検索",
      "sidebar.settings": "設定",
      "sidebar.home": "ホーム",
      "sidebar.notes": "ノート",
      "sidebar.favorites": "お気に入り",
      "sidebar.archive": "アーカイブ",
      "sidebar.signOut": "サインアウト",
      "sidebar.resizeTooltip": "ドラッグしてサイドバーの幅を変更",
      
      // ユーザー
      "user.workspace": "のワークスペース",
      "user.nameSuffix": "さん",
      
      // ノート
      "notes.untitled": "無題",
      "notes.noNotes": "ノートがありません",
      "notes.noNotesDescription": "新しいノートを作成してください",
      "notes.createFirst": "最初のノートを作成",
      "notes.search": "ノートを検索...",
      "notes.loading": "読み込み中...",
      "notes.title.placeholder": "無題",
      "notes.content.placeholder": "何か書いてみましょう...",
      "notes.lastModified": "最終更新",
      "notes.created": "作成日",
      "notes.wordCount": "文字数",
      "notes.readingTime": "読了時間",
      "notes.minute": "分",
      "notes.seconds": "秒",
      "notes.readOnly": "このノートは閲覧専用です。編集権限がありません。",
      "notes.creator": "作成者",
      "notes.view": "閲覧",
      "notes.hide": "非表示",
      "notes.notFound": "ノートが見つかりません",
      "notes.createdDate": "作成日",
      "notes.readOnlyNote": "※このノートは閲覧専用です",
      "notes.editing": "人が編集中",
      
      // エディター
      "editor.placeholder": "何か書いてみましょう...",
      "editor.formatting.bold": "太字",
      "editor.formatting.italic": "斜体",
      "editor.formatting.underline": "下線",
      "editor.formatting.code": "コード",
      "editor.formatting.link": "リンク",
      
      // 検索
      "search.title": "検索",
      "search.placeholder": "ノートを検索...",
      "search.noResults": "検索結果が見つかりません",
      "search.noResultsDescription": "別のキーワードで検索してみてください",
      "search.recentSearches": "最近の検索",
      "search.clearHistory": "履歴をクリア",
      
      // ホームページ
      "home.welcome": "ようこそ",
      "home.description": "ノートを作成して整理しましょう",
      "home.recentNotes": "最近のノート",
      "home.noRecentNotes": "最近のノートはありません",
      "home.createFirstNote": "最初のノートを作成",
      "home.privateNotes": "未公開ノート",
      "home.publicNotes": "公開ノート",
      "home.favoriteNotes": "お気に入りノート",
      "home.sortBy.createdAt": "作成日",
      "home.sortBy.views": "閲覧数",
      "home.sortBy.favorites": "お気に入り",
      "home.sortOrder.asc": "昇順",
      "home.sortOrder.desc": "降順",
      "home.noNotes": "ノートがないです",
      "home.noFavorites": "お気に入りのノートがありません",
      "home.noPublicNotes": "公開ノートがありません",
      "home.actions.edit": "編集",
      "home.actions.publish": "公開",
      "home.actions.published": "公開中",
      "home.actions.unpublish": "非公開にする",
      "home.actions.delete": "削除",
      "home.actions.favorite": "お気に入り",
      "home.actions.unfavorite": "お気に入り解除",
      "home.actions.copy": "コピー",
      "home.actions.duplicate": "複製",
      "home.createError": "ノートの作成に失敗しました。",
      "home.placeholder.title": "ノートのタイトルを入力",
      "home.createNote": "ノート作成",
      
      // ノート状態
      "status.draft": "下書き",
      "status.published": "公開済み",
      "status.archived": "アーカイブ済み",
      "status.private": "非公開",
      "status.public": "公開",
      "status.favorite": "お気に入り",
      "status.shared": "共有済み",
      "status.readOnly": "読み取り専用",
      "status.collaborative": "共同編集",
      
      // 設定モーダル
      "settings.title": "設定",
      "settings.general": "一般",
      "settings.account": "アカウント", 
      "settings.appearance": "外観",
      "settings.privacy": "プライバシー",
      
      // 一般設定
      "settings.general.title": "一般設定",
      "settings.autoSave": "自動保存",
      "settings.autoSave.description": "ノートの変更を自動的に保存します",
      "settings.defaultLanguage": "デフォルト言語",
      "settings.defaultLanguage.description": "新しいノートの既定言語",
      
      // 外観設定
      "settings.appearance.title": "外観設定",
      "settings.theme": "テーマ",
      "settings.theme.light": "ライト",
      "settings.theme.dark": "ダーク", 
      "settings.theme.system": "システム",
      "settings.fontSize": "フォントサイズ",
      "settings.fontSize.small": "小",
      "settings.fontSize.large": "大",
      
      // プライバシー設定
      "settings.privacy.title": "プライバシー設定",
      "settings.defaultNoteVisibility": "ノートの公開設定",
      "settings.defaultNoteVisibility.description": "新しいノートのデフォルト公開設定",
      "settings.visibility.private": "非公開",
      "settings.visibility.public": "公開",
      
      // アカウント設定
      "settings.account.title": "アカウント設定",
      "settings.profile": "プロフィール情報",
      "settings.displayName": "表示名",
      "settings.displayName.placeholder": "表示名を入力",
      "settings.bio": "バイオ",
      "settings.bio.placeholder": "自己紹介を入力",
      
      // 危険な操作
      "settings.dangerZone": "危険な操作",
      "settings.dangerZone.description": "以下の操作は取り消すことができません。",
      "settings.resetSettings": "設定をリセット",
      "settings.deleteAllData": "すべてのデータを削除",
      "settings.resetConfirm": "すべての設定をリセットしますか？この操作は取り消せません。",
      "settings.deleteConfirm": "本当にすべてのデータを削除しますか？この操作は取り消せません。",
      "settings.deleteNotImplemented": "この機能は実装されていません。",
      
      // 言語選択
      "language.ja": "日本語",
      "language.en": "English",
      
      // 共通
      "common.loading": "読み込み中...",
      "common.save": "保存",
      "common.cancel": "キャンセル",
      "common.delete": "削除",
      "common.edit": "編集",
      "common.close": "閉じる",
    }
  },
  en: {
    translation: {
      // サイドバー
      "sidebar.newNote": "New Note",
      "sidebar.search": "Search",
      "sidebar.settings": "Settings",
      "sidebar.home": "Home",
      "sidebar.notes": "Notes",
      "sidebar.favorites": "Favorites",
      "sidebar.archive": "Archive",
      "sidebar.signOut": "Sign Out",
      "sidebar.resizeTooltip": "Drag to resize sidebar",
      
      // ユーザー
      "user.workspace": "'s workspace",
      "user.nameSuffix": "",
      
      // ノート
      "notes.untitled": "Untitled",
      "notes.noNotes": "No notes yet",
      "notes.noNotesDescription": "Create your first note to get started",
      "notes.createFirst": "Create your first note",
      "notes.search": "Search notes...",
      "notes.loading": "Loading...",
      "notes.title.placeholder": "Untitled",
      "notes.content.placeholder": "Start writing...",
      "notes.lastModified": "Last modified",
      "notes.created": "Created",
      "notes.wordCount": "Words",
      "notes.readingTime": "Reading time",
      "notes.minute": "min",
      "notes.seconds": "sec",
      "notes.readOnly": "This note is read-only. You don't have permission to edit.",
      "notes.creator": "Creator",
      "notes.view": "View",
      "notes.hide": "Hide",
      "notes.notFound": "Note not found",
      "notes.createdDate": "Created",
      "notes.readOnlyNote": "※This note is read-only",
      "notes.editing": "editing",
      
      // エディター
      "editor.placeholder": "Start writing...",
      "editor.formatting.bold": "Bold",
      "editor.formatting.italic": "Italic",
      "editor.formatting.underline": "Underline",
      "editor.formatting.code": "Code",
      "editor.formatting.link": "Link",
      
      // 検索
      "search.title": "Search",
      "search.placeholder": "Search notes...",
      "search.noResults": "No search results found",
      "search.noResultsDescription": "Try searching with different keywords",
      "search.recentSearches": "Recent searches",
      "search.clearHistory": "Clear history",
      
      // ホームページ
      "home.welcome": "Welcome",
      "home.description": "Create and organize your notes",
      "home.recentNotes": "Recent notes",
      "home.noRecentNotes": "No recent notes",
      "home.createFirstNote": "Create your first note",
      "home.privateNotes": "Private Notes",
      "home.publicNotes": "Public Notes",
      "home.favoriteNotes": "Favorite Notes",
      "home.sortBy.createdAt": "Created Date",
      "home.sortBy.views": "Views",
      "home.sortBy.favorites": "Favorites",
      "home.sortOrder.asc": "Ascending",
      "home.sortOrder.desc": "Descending",
      "home.noNotes": "No notes yet",
      "home.noFavorites": "No favorite notes yet",
      "home.noPublicNotes": "No public notes yet",
      "home.actions.edit": "Edit",
      "home.actions.publish": "Publish",
      "home.actions.published": "Published",
      "home.actions.unpublish": "Make Private",
      "home.actions.delete": "Delete",
      "home.actions.favorite": "Favorite",
      "home.actions.unfavorite": "Unfavorite",
      "home.actions.copy": "Copy",
      "home.actions.duplicate": "Duplicate",
      "home.createError": "Failed to create note.",
      "home.placeholder.title": "Enter note title",
      "home.createNote": "Create Note",
      
      // ノート状態
      "status.draft": "Draft",
      "status.published": "Published",
      "status.archived": "Archived",
      "status.private": "Private",
      "status.public": "Public",
      "status.favorite": "Favorite",
      "status.shared": "Shared",
      "status.readOnly": "Read Only",
      "status.collaborative": "Collaborative",
      
      // 設定モーダル
      "settings.title": "Settings",
      "settings.general": "General",
      "settings.account": "Account",
      "settings.appearance": "Appearance", 
      "settings.notifications": "Notifications",
      "settings.privacy": "Privacy",
      
      // 一般設定
      "settings.general.title": "General Settings",
      "settings.autoSave": "Auto Save",
      "settings.autoSave.description": "Automatically save changes to notes",
      "settings.defaultLanguage": "Default Language",
      "settings.defaultLanguage.description": "Default language for new notes",
      
      // 外観設定
      "settings.appearance.title": "Appearance Settings",
      "settings.theme": "Theme",
      "settings.theme.light": "Light",
      "settings.theme.dark": "Dark",
      "settings.theme.system": "System",
      "settings.fontSize": "Font Size",
      "settings.fontSize.small": "Small",
      "settings.fontSize.large": "Large",
      
      // プライバシー設定
      "settings.privacy.title": "Privacy Settings",
      "settings.defaultNoteVisibility": "Note Visibility",
      "settings.defaultNoteVisibility.description": "Default visibility for new notes",
      "settings.visibility.private": "Private",
      "settings.visibility.public": "Public",
      
      // アカウント設定
      "settings.account.title": "Account Settings",
      "settings.profile": "Profile Information",
      "settings.displayName": "Display Name",
      "settings.displayName.placeholder": "Enter display name",
      "settings.bio": "Bio",
      "settings.bio.placeholder": "Enter bio",
      
      // 危険な操作
      "settings.dangerZone": "Danger Zone",
      "settings.dangerZone.description": "These actions cannot be undone.",
      "settings.resetSettings": "Reset Settings",
      "settings.deleteAllData": "Delete All Data",
      "settings.resetConfirm": "Reset all settings? This action cannot be undone.",
      "settings.deleteConfirm": "Really delete all data? This action cannot be undone.",
      "settings.deleteNotImplemented": "This feature is not implemented yet.",
      
      // 言語選択
      "language.ja": "日本語",
      "language.en": "English",
      
      // 共通
      "common.loading": "Loading...",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.close": "Close",
    }
  }
};

// 初期化関数を分離
const initI18n = (language: string = 'ja') => {
  return i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language, // 明示的に言語を指定
      fallbackLng: 'ja',
      debug: false,
      
      interpolation: {
        escapeValue: false,
      },
    });
};

// デフォルトで日本語で初期化
initI18n('ja');

export { initI18n };
export default i18n;
