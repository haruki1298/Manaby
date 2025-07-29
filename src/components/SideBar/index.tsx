import { FC, useState, useRef, useCallback, useEffect } from 'react';
import { Item } from './Item';
import { NoteList } from '../NoteList';
import UserItem from './UserItem';
import { Plus, Search, Settings, LogOut } from 'lucide-react';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { useNoteStore } from '@/modules/notes/note.state';
import { noteRepository } from '@/modules/notes/note.repository';
import { Link,useNavigate } from 'react-router-dom';
import { authRepository } from '@/modules/auth/auath.repository';
import { SettingsModal } from '../SettingsModal';
import { useTranslation } from 'react-i18next';

type Props = {
  onSearchButtonClicked: () => void;
  onWidthChange?: (width: number) => void;
};

const SideBar: FC<Props> = ({ onSearchButtonClicked, onWidthChange }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUserStore = useCurrentUserStore();
  const noteStore = useNoteStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // リサイズ機能の状態
  const [sidebarWidth, setSidebarWidth] = useState(240); // デフォルト幅
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // モバイル検知
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // リサイズ処理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = e.clientX;
    const minWidth = 200;
    const maxWidth = 400;
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // グローバルマウスイベント
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // ローカルストレージに幅を保存
  useEffect(() => {
    localStorage.setItem('sidebar-width', sidebarWidth.toString());
    onWidthChange?.(sidebarWidth);
  }, [sidebarWidth, onWidthChange]);

  // 初期化時にローカルストレージから幅を復元
  useEffect(() => {
    const savedWidth = localStorage.getItem('sidebar-width');
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (width >= 200 && width <= 400) {
        setSidebarWidth(width);
      }
    }
  }, []);

  const createNote = async () => {
    const newNote = await noteRepository.create(
      currentUserStore.currentUser!.id,
      {}
    );
    noteStore.set([newNote]);
    navigate(`/notes/${newNote.id}`);
  };

  const signout = async () => {
    await authRepository.signout();
    currentUserStore.set(undefined);
    noteStore.clear();
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  return (
    <>
      <aside 
        ref={sidebarRef}
        className="group/sidebar h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto fixed left-0 top-0 z-50 flex flex-col shadow-sm"
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="flex flex-col h-full">
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
            <UserItem
              user={currentUserStore.currentUser!}
              signout={signout}
            />
          </div>
          
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
            <Item 
              label={t('sidebar.search')} 
              icon={Search} 
              onClick={onSearchButtonClicked}
            />
            <Item 
              label={t('sidebar.settings')} 
              icon={Settings} 
              onClick={openSettings}
            />
            {/* モバイル時のログアウトボタン */}
            {isMobile && (
              <Item 
                label={t('auth.logout', 'ログアウト')} 
                icon={LogOut} 
                onClick={signout}
              />
            )}
          </div>
          
          <div className="flex-1 p-3">
            <div className="mb-4">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 px-2">
                {t('sidebar.notes')}
              </p>
              <NoteList />
            </div>
            
            <div className="mt-auto">
              <Item 
                label={t('sidebar.newNote')} 
                icon={Plus} 
                onClick={createNote}
              />
            </div>
          </div>
          
          <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <Link 
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-150 font-medium" 
              to={'/'}
            >
              🏠 {t('sidebar.home')}へ戻る
            </Link>
          </div>
        </div>
        
        {/* リサイズハンドル */}
        <div
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 hover:opacity-50 transition-colors duration-150 group-hover/sidebar:opacity-100 opacity-0"
          onMouseDown={handleMouseDown}
          title={t('sidebar.resizeTooltip')}
        />
      </aside>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onLogout={signout}
      />
    </>
  );
};

export default SideBar;
