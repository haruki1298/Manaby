import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { noteRepository } from '@/modules/notes/note.repository';
import { useNoteStore } from '@/modules/notes/note.state';
import { Star, StarOff, Plus } from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Note } from '@/modules/notes/note.entity';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';

type NoteWithCreator = Note & {
  creator_name?: string;
};

type SortKey = 'created_at' | 'title' | 'views';
type SortOrder = 'asc' | 'desc';

export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const { currentUser } = useCurrentUserStore();
  const noteStore = useNoteStore();

  // 公開ノート用の状態
  const [publicNotes, setPublicNotes] = useState<NoteWithCreator[]>([]);

  // お気に入りノートIDの配列
  const [favoriteNoteIds, setFavoriteNoteIds] = useState<number[]>([]);

  // フィルター機能の状態
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showOnlyMyNotes, setShowOnlyMyNotes] = useState(false);

  // 並び替え機能の状態
  const [privateSortKey, setPrivateSortKey] = useState<SortKey>('created_at');
  const [privateSortOrder, setPrivateSortOrder] = useState<SortOrder>('desc');
  const [publicSortKey, setPublicSortKey] = useState<SortKey>('created_at');
  const [publicSortOrder, setPublicSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    fetchPublicNotes();
    
    // Supabaseのリアルタイム機能で公開ノートの変更を監視
    const channel = supabase
      .channel('public-notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
        },
        (payload: any) => {
          console.log('Notes changed:', payload);
          
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          if (eventType === 'INSERT' && newRecord?.is_public) {
            fetchPublicNotes();
          } else if (eventType === 'UPDATE') {
            const wasPublic = oldRecord?.is_public;
            const isNowPublic = newRecord?.is_public;
            
            if (!wasPublic && isNowPublic) {
              fetchPublicNotes();
            } else if (wasPublic && !isNowPublic) {
              setPublicNotes(prev => prev.filter(note => note.id !== newRecord.id));
            } else if (wasPublic && isNowPublic) {
              fetchPublicNotes();
            }
          } else if (eventType === 'DELETE' && oldRecord?.is_public) {
            setPublicNotes(prev => prev.filter(note => note.id !== oldRecord.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ポーリング機能（頻度を5分に減らして負荷軽減）
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchPublicNotes();
    }, 300000); // 5分間隔

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  // お気に入り情報をローカルストレージから取得
  useEffect(() => {
    const stored = localStorage.getItem('favoriteNoteIds');
    if (stored) setFavoriteNoteIds(JSON.parse(stored));
  }, []);

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
    }
  };

  // ノート一覧取得
  const notes = noteStore.getAll();

  // 公開ノート取得
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
    await noteRepository.setPublic(noteId, false);
    fetchPublicNotes();
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

  // ノート閲覧時に閲覧数を増加（デバウンス機能付き）
  const incrementViewDebounce = useMemo(() => new Set<number>(), []);
  
  const handleViewNote = useCallback(async (noteId: number, path: string) => {
    // 短時間での重複実行を防ぐ
    if (incrementViewDebounce.has(noteId)) {
      navigate(path);
      return;
    }
    
    incrementViewDebounce.add(noteId);
    
    try {
      await noteRepository.incrementViews(noteId);
      // 公開ノートの場合は再取得して最新の閲覧数を反映
      if (path.startsWith('/public/')) {
        fetchPublicNotes();
      }
    } catch (error) {
      console.error('Failed to increment views:', error);
    } finally {
      // 3秒後にデバウンスを解除
      setTimeout(() => {
        incrementViewDebounce.delete(noteId);
      }, 3000);
    }
    
    navigate(path);
  }, [incrementViewDebounce, navigate]);

  // 並び替え関数（メモ化）
  const getSortedNotes = useCallback(<T extends Note>(
    notes: T[],
    sortKey: SortKey,
    sortOrder: SortOrder,
  ): T[] => {
    return [...notes].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortKey) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'title':
          aValue = (a.title ?? '').toLowerCase();
          bValue = (b.title ?? '').toLowerCase();
          break;
        case 'views':
          aValue = Number(a.views ?? 0);
          bValue = Number(b.views ?? 0);
          break;
        default:
          return 0;
      }
      
      if (sortKey === 'title') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });
  }, []);

  // フィルター機能（メモ化）
  const getFilteredNotes = useCallback((notes: NoteWithCreator[]) => {
    let filtered = [...notes];
    
    // お気に入りのみ表示フィルター
    if (showOnlyFavorites) {
      filtered = filtered.filter(note => favoriteNoteIds.includes(note.id));
    }
    
    // 自分の作成したノートのみ表示フィルター
    if (showOnlyMyNotes) {
      filtered = filtered.filter(note => note.user_id === currentUser?.id);
    }
    
    return filtered;
  }, [showOnlyFavorites, showOnlyMyNotes, favoriteNoteIds, currentUser?.id]);

  // 処理済みのノートリストをメモ化
  const processedPrivateNotes = useMemo(() => {
    const filtered = notes.filter((note) => !note.is_public);
    return getSortedNotes(filtered, privateSortKey, privateSortOrder);
  }, [notes, privateSortKey, privateSortOrder, getSortedNotes]);

  const processedPublicNotes = useMemo(() => {
    const filtered = getFilteredNotes(publicNotes);
    return getSortedNotes(filtered, publicSortKey, publicSortOrder);
  }, [publicNotes, publicSortKey, publicSortOrder, getFilteredNotes, getSortedNotes]);

  const processedFavoriteNotes = useMemo(() => {
    return favoriteNoteIds
      .map((id) => publicNotes.find((note) => note.id === id))
      .filter((note): note is NoteWithCreator => !!note);
  }, [favoriteNoteIds, publicNotes]);

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

        {/* ノート一覧の表示 */}
        <div className="space-y-8">
          {/* 未公開ノート（作成日とタイトルのみ） */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-primary-300">{t('home.privateNotes')}</span>
              <select
                className="border rounded px-2 py-1 text-xs"
                value={privateSortKey}
                onChange={(e) => setPrivateSortKey(e.target.value as SortKey)}
              >
                <option value="created_at">{t('home.sortBy.createdAt')}</option>
                <option value="title">{t('home.sortBy.title')}</option>
              </select>
              <button
                className="border rounded px-2 py-1 text-xs hover:bg-gray-100"
                onClick={() => setPrivateSortOrder(privateSortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {privateSortOrder === 'asc' ? t('home.sortOrder.asc') : t('home.sortOrder.desc')}
              </button>
            </div>
            <ul className="mt-2">
              {processedPrivateNotes.length === 0 ? (
                <li className="text-gray-400 italic py-2">{t('home.noNotes')}</li>
              ) : (
                processedPrivateNotes.map((note) => (
                  <li
                    key={note.id}
                    className="flex items-center justify-between py-2 border-b"
                  >
                    <div>
                      <span className="block">{note.title ?? t('notes.untitled')}</span>
                      <span className="block text-xs text-gray-400 mt-1">
                        {t('notes.created')}: {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <button
                        className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded"
                        onClick={() => handleViewNote(note.id, `/notes/${note.id}`)}
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

          {/* 公開ノート（全機能付き） */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold">{t('home.publicNotes')}</span>
              <select
                className="border rounded px-2 py-1 text-xs"
                value={publicSortKey}
                onChange={(e) => setPublicSortKey(e.target.value as SortKey)}
              >
                <option value="created_at">{t('home.sortBy.createdAt')}</option>
                <option value="title">{t('home.sortBy.title')}</option>
                <option value="views">{t('home.sortBy.views')}</option>
              </select>
              <button
                className="border rounded px-2 py-1 text-xs hover:bg-gray-100"
                onClick={() => setPublicSortOrder(publicSortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {publicSortOrder === 'asc' ? t('home.sortOrder.asc') : t('home.sortOrder.desc')}
              </button>
            </div>
            
            {/* フィルターオプション */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">{t('home.filter')}:</span>
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={showOnlyFavorites}
                  onChange={(e) => setShowOnlyFavorites(e.target.checked)}
                  className="mr-1"
                />
                {t('home.filter.onlyFavorites')}
              </label>
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={showOnlyMyNotes}
                  onChange={(e) => setShowOnlyMyNotes(e.target.checked)}
                  className="mr-1"
                />
                {t('home.filter.onlyMyNotes')}
              </label>
            </div>
            
            <ul className="mt-2">
              {processedPublicNotes.length === 0 ? (
                <li className="text-gray-400 italic py-2">{t('home.noPublicNotes')}</li>
              ) : (
                processedPublicNotes.map((note) => (
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
                        {t('notes.creator')}: {note.creator_name || 'Unknown User'} • 
                        閲覧数: {note.views || 0} • 
                        {t('notes.created')}: {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      {note.user_id === currentUser?.id ? (
                        <>
                          <button
                            className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded"
                            onClick={() => handleViewNote(note.id, `/notes/${note.id}`)}
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
                            onClick={() => handleViewNote(note.id, `/public/${note.id}`)}
                          >
                            {t('notes.view')}
                          </button>
                        </>
                      ) : (
                        <button
                          className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded"
                          onClick={() => handleViewNote(note.id, `/public/${note.id}`)}
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
              {processedFavoriteNotes.length === 0 ? (
                <li className="text-gray-400 italic py-2">
                  {t('home.noFavorites')}
                </li>              
              ) : (                
                processedFavoriteNotes.map((note) => (
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
                        {t('notes.creator')}: {note.creator_name || 'Unknown User'} • 
                        閲覧数: {note.views || 0} • 
                        {t('notes.created')}: {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <button
                        className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded"
                        onClick={() => handleViewNote(note.id, `/public/${note.id}`)}
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
      </CardContent>
    </Card>
  );
}
