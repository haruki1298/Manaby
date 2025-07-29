import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import SideBar from './components/SideBar';
import { SearchModal } from './components/SearchModal';
import { useCurrentUserStore } from './modules/auth/current-user.state';
import { useNoteStore } from './modules/notes/note.state';
import { useEffect, useState } from 'react';
import { noteRepository } from './modules/notes/note.repository';
import { Note } from './modules/notes/note.entity';
import { subscribe, unsubscribe } from './lib/supabase';

// ▼▼▼ 通知機能関連のインポート ▼▼▼
import { useNotifications } from '@/hooks/useNotifications';
import { Bell } from 'lucide-react';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'; // パスを確認
// ▲▲▲ ここまで ▲▲▲

const Layout = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUserStore();
  const noteStore = useNoteStore();
  const [isLoading, setIsLoading] = useState(false); // ★ 初期値を false に変更
  const [isShowModel, setIsShowModel] = useState(false);
  const [searchResult, setSearchResult] = useState<Note[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ▼▼▼ 通知フックの呼び出しとドロップダウンの状態管理 ▼▼▼
  const { unreadCount } = useNotifications();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  // ▲▲▲ ここまで ▲▲▲

  // レスポンシブ検知
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false); // デスクトップでは自動でサイドバーを閉じる
      }
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    // currentUser が確定してからノートを取得・購読する
    if (currentUser) {
      fetchNotes();
      const channel = subscribeNote();
      return () => {
        if(channel) unsubscribe(channel!);
      };
    }
  }, [currentUser]); // currentUser が変更されたら再実行

  // サイドバー幅の復元 (これは currentUser と無関係なので分離)
  useEffect(() => {
    const savedWidth = localStorage.getItem('sidebar-width');
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (width >= 200 && width <= 400) {
        setSidebarWidth(width);
      }
    }
  }, []);

  const subscribeNote = () => {
    if (currentUser == null) return null; // null を返すように修正
    return subscribe(currentUser.id, (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        noteStore.set([payload.new]);
      } else if (payload.eventType === 'DELETE') {
        noteStore.delete(payload.old.id!);
      }
    });
  };

  const fetchNotes = async () => {
    if (!currentUser) return;
    setIsLoading(true); // ★ データの取得開始時に true にする
    const notes = await noteRepository.find(currentUser.id);
    if (notes == null) {
        setIsLoading(false); // データがなくてもローディングは終了
        return;
    };
    noteStore.set(notes);
    setIsLoading(false); // ★ データの取得完了時に false にする
  };

  const searchNotes = async (keyword: string) => {
    if (!currentUser) return;
    const notes = await noteRepository.findByKeyword(currentUser.id, keyword)
    if(notes == null) return;
    noteStore.set(notes);
    setSearchResult(notes);
  };

  const moveToDetail = (noteId: number) => {
    navigate(`notes/${noteId}`);
    setIsShowModel(false);
  };

  const handleSidebarWidthChange = (width: number) => {
    setSidebarWidth(width);
    localStorage.setItem('sidebar-width', width.toString());
  };

  if (currentUser == null) return <Navigate replace to="signin" />;

  return (
    <div className="h-full flex bg-neutral-50 dark:bg-neutral-900">
      {/* モバイル用ハンバーガーメニュー */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-3 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Manaby</h1>
          
          {/* モバイル通知ベル */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(prev => !prev)}
              className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="通知"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {isNotificationOpen && <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />}
          </div>
        </div>
      )}

      {/* サイドバー - モバイルではオーバーレイ、デスクトップでは固定 */}
      {!isLoading && (
        <div className={`
          ${isMobile 
            ? `fixed inset-0 z-40 ${isSidebarOpen ? 'block' : 'hidden'}` 
            : 'block'
          }
        `}>
          {/* モバイルオーバーレイ背景 */}
          {isMobile && isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          <div className={`
            ${isMobile 
              ? 'fixed left-0 top-0 h-full w-64 z-50' 
              : 'relative'
            }
          `}>
            <SideBar
              onSearchButtonClicked={() => {
                setIsShowModel(true);
                if (isMobile) setIsSidebarOpen(false);
              }}
              onWidthChange={handleSidebarWidthChange}
            />
          </div>
        </div>
      )}
      
      {/* メインコンテンツ */}
      <main
        className={`
          h-full overflow-y-auto bg-white dark:bg-neutral-900 transition-all duration-150 relative
          ${isMobile ? 'pt-16' : ''}
        `}
        style={{
          marginLeft: !isMobile ? `${sidebarWidth}px` : '0',
          width: !isMobile ? `calc(100% - ${sidebarWidth}px)` : '100%'
        }}
      >
        {/* デスクトップ通知ベル */}
        {!isMobile && (
          <div className="absolute top-4 right-6 z-50">
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(prev => !prev)}
                className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="通知"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {isNotificationOpen && <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />}
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <Outlet />
        </div>
        
        <SearchModal
          isOpen={isShowModel}
          notes={searchResult}
          onItemSelect={moveToDetail}
          onKeywordChanged={searchNotes}
          onClose={() => setIsShowModel(false)}
        />
      </main>
    </div>
  );
};

export default Layout;