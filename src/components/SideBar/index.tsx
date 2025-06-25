import { FC } from 'react';
import { Item } from './Item';
import { NoteList } from '../NoteList';
import UserItem from './UserItem';
import { Plus, Search, Settings } from 'lucide-react';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { useNoteStore } from '@/modules/notes/note.state';
import { noteRepository } from '@/modules/notes/note.repository';
import { Link,useNavigate } from 'react-router-dom';
import { authRepository } from '@/modules/auth/auath.repository';
import { SettingsModal } from '../SettingsModal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  onSearchButtonClicked: () => void;
};

const SideBar: FC<Props> = ({ onSearchButtonClicked }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUserStore = useCurrentUserStore();
  const noteStore = useNoteStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
      <aside className="group/sidebar h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto relative flex flex-col w-60 shadow-sm">
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
      </aside>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      
      <div className="absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]"></div>
    </>
  );
};

export default SideBar;
