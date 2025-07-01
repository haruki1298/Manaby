import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { noteRepository } from '@/modules/notes/note.repository';
import { useNoteStore } from '@/modules/notes/note.state';
import { Star, StarOff, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Note } from '@/modules/notes/note.entity';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';

type NoteWithCreator = Note & {
  creator_name?: string;
};

export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const { currentUser } = useCurrentUserStore();
  const noteStore = useNoteStore();

  // 公開ノート用の状態
  const [publicNotes, setPublicNotes] = useState<NoteWithCreator[]>([]);

  // お気に入りノートIDの配列
  const [favoriteNoteIds, setFavoriteNoteIds] = useState<number[]>([]);  useEffect(() => {
    fetchPublicNotes();
    
    // Supabaseのリアルタイム機能で公開ノートの変更を監視
    const channel = supabase
      .channel('public-notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE すべての変更を監視
          schema: 'public',
          table: 'notes',
        },
        (payload: any) => {
          console.log('Notes changed:', payload);
          
          // 公開ノートに関連する変更のみ処理
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          if (eventType === 'INSERT' && newRecord?.is_public) {
            // 新しい公開ノートが追加された場合
            fetchPublicNotes();
          } else if (eventType === 'UPDATE') {
            // ノートが更新された場合
            const wasPublic = oldRecord?.is_public;
            const isNowPublic = newRecord?.is_public;
            
            if (!wasPublic && isNowPublic) {
              // 非公開から公開に変更された場合
              fetchPublicNotes();
            } else if (wasPublic && !isNowPublic) {
              // 公開から非公開に変更された場合
              setPublicNotes(prev => prev.filter(note => note.id !== newRecord.id));
            } else if (wasPublic && isNowPublic) {
              // 公開ノートの内容が更新された場合
              fetchPublicNotes();
            }
          } else if (eventType === 'DELETE' && oldRecord?.is_public) {
            // 公開ノートが削除された場合
            setPublicNotes(prev => prev.filter(note => note.id !== oldRecord.id));
          }
        }
      )
      .subscribe();

    // クリーンアップ関数でサブスクリプションを解除
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ポーリング機能（リアルタイム機能のフォールバック）
  useEffect(() => {
    // 30秒ごとに公開ノートを更新
    const pollInterval = setInterval(() => {
      fetchPublicNotes();
    }, 30000); // 30秒間隔

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  // お気に入り情報をローカルストレージから取得
  useEffect(() => {
    const stored = localStorage.getItem('favoriteNoteIds');
    if (stored) setFavoriteNoteIds(JSON.parse(stored));
  }, []);

  // ノート作成処理
  const createNote = async () => {
    if (!title.trim() || !currentUser) return;

    try {
      const newNote = await noteRepository.create(currentUser.id, { title });
      noteStore.set([newNote]);
      setTitle('');
      navigate(`/notes/${newNote.id}`);
    } catch (error) {
      console.error('Failed to create note:', error);
      alert(t('home.createError'));
    }  };

  // ノート一覧取得（例: jotaiストアから）
  const notes = noteStore.getAll();  // 公開ノート取得
  const fetchPublicNotes = async () => {
    try {
      const notes = await noteRepository.findPublicNotes();
      setPublicNotes((notes as any) ?? []);
    } catch (error) {
      console.error('Failed to fetch public notes:', error);
      setPublicNotes([]);
    }
  };

  // 公開ノート削除
  const handleDeletePublicNote = async (noteId: number) => {
    await noteRepository.setPublic(noteId, false); // 公開解除（未公開に戻す）
    fetchPublicNotes();
    // 必要なら noteStore の該当ノートも更新
    const updated = notes.map((note) =>
      note.id === noteId ? { ...note, is_public: false } : note,
    );
    noteStore.set(updated);
  };

  // お気に入り状態を保存
  const saveFavorites = (ids: number[]) => {
    setFavoriteNoteIds(ids);
    localStorage.setItem('favoriteNoteIds', JSON.stringify(ids));
  };

  // お気に入り切り替え
  const toggleFavorite = (noteId: number) => {
    const updated = favoriteNoteIds.includes(noteId)
      ? favoriteNoteIds.filter((id) => id !== noteId)
      : [...favoriteNoteIds, noteId];
    saveFavorites(updated);
  };

  // ノート一覧を表示する関数
  const renderNoteList = () => {
    return (
      <div className="space-y-8">
        {/* 未公開ノート */}
        <div>
          <span className="font-bold text-primary-300">{t('home.privateNotes')}</span>
          <ul className="mt-2">
            {notes.filter((note) => !note.is_public).length === 0 ? (
              <li className="text-gray-400 italic py-2">{t('home.noNotes')}</li>
            ) : (
              notes.filter((note) => !note.is_public).map((note) => (
                <li
                  key={note.id}
                  className="flex items-center justify-between py-2 border-b"
                >
                  <span>{note.title ?? t('notes.untitled')}</span>
                  <div>
                    <button
                      className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded"
                      onClick={() => navigate(`/notes/${note.id}`)}
                    >
                      {t('home.actions.edit')}
                    </button>
                    <button
                      className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded"
                      onClick={async () => {
                        await noteRepository.setPublic(note.id, true);
                        fetchPublicNotes();
                      }}
                      disabled={note.is_public ?? false}
                    >
                      {note.is_public ? t('home.actions.published') : t('home.actions.publish')}
                    </button>
                    <button
                      className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded"
                      onClick={async () => {
                        await noteRepository.delete(note.id);
                        noteStore.delete(note.id);
                      }}
                    >
                      {t('home.actions.delete')}
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* 公開ノート */}
        <div>
          <span className="font-bold">{t('home.publicNotes')}</span>
          <ul className="mt-2">
            {publicNotes.length === 0 ? (
              <li className="text-gray-400 italic py-2">{t('home.noPublicNotes')}</li>
            ) : (
              publicNotes.map((note) => (
                <li
                  key={note.id}
                  className="flex items-center justify-between py-2 border-b text-500"
                >
                  <div>
                    <span className="block flex items-center">
                      <button
                        className="mr-2 p-1 rounded bg-transparent hover:bg-gray-200 transition"
                        onClick={() => toggleFavorite(note.id)}
                        aria-label={t('home.actions.favorite')}
                      >
                        {favoriteNoteIds.includes(note.id) ? (
                          <Star className="inline h-4 w-4 text-yellow-400" />
                        ) : (
                          <StarOff className="inline h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      {note.title ?? t('notes.untitled')}
                    </span>
                    <span className="block text-xs text-gray-400 mt-1">
                      {t('notes.creator')}: {note.creator_name || 'Unknown User'}
                    </span>
                  </div>
                  <div>
                    {note.user_id === currentUser?.id ? (
                      <>
                        <button
                          className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded"
                          onClick={() => navigate(`/notes/${note.id}`)}
                        >
                          {t('home.actions.edit')}
                        </button>
                        <button
                          className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded"
                          onClick={() => handleDeletePublicNote(note.id)}
                        >
                          {t('notes.hide')}
                        </button>
                        <button
                          className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded"
                          onClick={() => navigate(`/public/${note.id}`)}
                        >
                          {t('notes.view')}
                        </button>
                      </>
                    ) : (
                      <button
                        className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded"
                        onClick={() => navigate(`/public/${note.id}`)}
                      >
                        {t('notes.view')}
                      </button>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* お気に入りノート */}
        <div>
          <h3 className="mb-2 font-bold">{t('home.favoriteNotes')}</h3>
          <ul>
            {favoriteNoteIds
              .map((id) => publicNotes.find((note) => note.id === id))
              .filter((note): note is NoteWithCreator => !!note).length === 0 ? (
              <li className="text-gray-400 italic py-2">
                {t('home.noFavorites')}
              </li>              
            ) : (                
              favoriteNoteIds
                .map((id) => publicNotes.find((note) => note.id === id))
                .filter((note): note is NoteWithCreator => !!note)
                .map((note) => (
                  <li
                    key={note.id}
                    className="flex items-center justify-between py-2 border-b"
                  >
                    <div>
                      <span className="block flex items-center">
                        <button
                          className="mr-2 p-1 rounded bg-transparent hover:bg-gray-200 transition"
                          onClick={() => toggleFavorite(note.id)}
                          aria-label={t('home.actions.unfavorite')}
                        >
                          <Star className="inline h-4 w-4 text-yellow-400" />
                        </button>
                        {note.title ?? t('notes.untitled')}
                      </span>
                      <span className="block text-xs text-gray-400 mt-1">
                        {t('notes.creator')}: {note.creator_name || 'Unknown User'}
                      </span>
                    </div>
                    <div>
                      <button
                        className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded"
                        onClick={() => navigate(`/public/${note.id}`)}
                      >
                        {t('notes.view')}
                      </button>
                    </div>
                  </li>
                ))
            )}
          </ul>
        </div>
      </div>
    );
  };



  // ページフォーカス時の更新
  useEffect(() => {
    const handleFocus = () => {
      fetchPublicNotes();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <Card className="border-0 shadow-none w-1/2 m-auto">
      <CardHeader className="px-4 pb-3">
        <CardTitle className="text-lg font-medium text-improved">
          {t('home.description')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {/* ノート作成フォーム */}
        <div className="flex gap-2 mb-4">
          <input
            className="input-white-bg h-9 flex-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
            placeholder={t('home.placeholder.title')}
            type="text"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            onKeyDown={(e) => e.key === 'Enter' && createNote()}
          />
          <button
            className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={createNote}
            disabled={!title.trim()}
          >
            <Plus className="h-4 w-4" />
            <span className="ml-1">{t('home.createNote')}</span>
          </button>
        </div>

        {/* カテゴリ順序管理 */}
        
        {/* ノート一覧の表示 */}
        <div>
          {renderNoteList()}
        </div>
      </CardContent>
    </Card>
  );
}
