import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { noteRepository } from '@/modules/notes/note.repository';
import { useNoteStore } from '@/modules/notes/note.state';
import { Star, StarOff, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShareModal } from '@/components/ShareModal';
import { Note } from '@/modules/notes/note.entity';
import { supabase } from '@/lib/supabase';

type NoteWithCreator = Note & {
  creator_name?: string;
};

type SortKey = 'created_at' | 'views';

export function Home() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const { currentUser } = useCurrentUserStore();
  const noteStore = useNoteStore();

  // 共有モーダル用の状態
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  // 公開ノート用の状態
  const [publicNotes, setPublicNotes] = useState<NoteWithCreator[]>([]);

  // お気に入りノートIDの配列
  const [favoriteNoteIds, setFavoriteNoteIds] = useState<number[]>([]);

  // 未公開ノート用
  const [privateSortKey, setPrivateSortKey] = useState<SortKey>('created_at');
  const [privateSortOrder, setPrivateSortOrder] = useState<'asc' | 'desc'>('desc');
  // 公開ノート用
  const [publicSortKey, setPublicSortKey] = useState<SortKey>('created_at');
  const [publicSortOrder, setPublicSortOrder] = useState<'asc' | 'desc'>('desc');  useEffect(() => {
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
      alert('ノートの作成に失敗しました。');
    }  };

  // 共有処理（API呼び出し部分は仮実装。実際はtRPCやAPI経由で実装）
  const handleShare = async (email: string) => {
    try {
      // await api.note.share.mutate({ noteId: selectedNote!.id, email });
      alert(`「${selectedNote?.title ?? '無題'}」を${email}に共有しました（API実装は別途）`);
      setIsShareModalOpen(false);
      setSelectedNote(null);
    } catch (e: any) {
      alert(e.message ?? '共有に失敗しました');
    }
  };

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
  // 並び替え関数
  const getSortedNotes = <T extends Note>(
    notes: T[],
    sortKey: SortKey,
    sortOrder: 'asc' | 'desc',
  ): T[] => {
    return [...notes].sort((a, b) => {
      if (sortKey === 'created_at') {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
      } else if (sortKey === 'views') {
        const aViews = Number(a.views ?? 0);
        const bViews = Number(b.views ?? 0);
        return sortOrder === 'asc' ? aViews - bViews : bViews - aViews;
      }
      return 0;
    });
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
        <CardTitle className="text-lg font-medium">
          新しいノートを作成してみましょう
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {/* ノート作成フォーム */}
        <div className="flex gap-2 mb-4">
          <input
            className="h-9 flex-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
            placeholder="ノートのタイトルを入力"
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
            <span className="ml-1">ノート作成</span>
          </button>
        </div>

        {/* 未公開ノート */}
        <div className="flex gap-2 mb-2 items-center">
          <span className="font-bold text-primary-300">未公開ノート</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={privateSortKey}
            onChange={(e) => setPrivateSortKey(e.target.value as SortKey)}
          >
            <option value="created_at">作成日</option>
            <option value="views">閲覧数</option>
          </select>
          <button
            className="border rounded px-2 py-1 text-sm"
            onClick={() =>
              setPrivateSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'))
            }
          >
            {privateSortOrder === 'asc' ? '昇順' : '降順'}
          </button>
        </div>
        <ul>
          {getSortedNotes(
            notes.filter((note) => !note.is_public),
            privateSortKey,
            privateSortOrder,
          ).length === 0 ? (
            <li className="text-gray-400 italic py-2">ノートがないです</li>
          ) : (
            getSortedNotes(
              notes.filter((note) => !note.is_public),
              privateSortKey,
              privateSortOrder,
            ).map((note) => (
              <li
                key={note.id}
                className="flex items-center justify-between py-2 border-b"
              >
                <span>{note.title ?? '無題'}</span>
                <div>
                  <button
                    className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded"
                    onClick={() => navigate(`/notes/${note.id}`)}
                  >
                    編集
                  </button>
                  <button
                    className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded"
                    onClick={async () => {
                      await noteRepository.setPublic(note.id, true);
                      fetchPublicNotes();
                    }}
                    disabled={note.is_public ?? false}
                  >
                    {note.is_public ? '公開中' : '公開'}
                  </button>
                  <button
                    className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded"
                    onClick={async () => {
                      await noteRepository.delete(note.id);
                      noteStore.delete(note.id);
                    }}
                  >
                    削除
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        {/* 公開ノート */}
        <div className="flex gap-2 mt-8 mb-2 items-center">
          <span className="font-bold">公開ノート</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={publicSortKey}
            onChange={(e) => setPublicSortKey(e.target.value as SortKey)}
          >
            <option value="created_at">作成日</option>
            <option value="views">閲覧数</option>
          </select>
          <button
            className="border rounded px-2 py-1 text-sm"
            onClick={() =>
              setPublicSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'))
            }
          >
            {publicSortOrder === 'asc' ? '昇順' : '降順'}
          </button>
        </div>
        <ul>
          {getSortedNotes(publicNotes, publicSortKey, publicSortOrder).length ===
          0 ? (
            <li className="text-gray-400 italic py-2">ノートがありません</li>
          ) : (
            getSortedNotes(
              publicNotes,
              publicSortKey,
              publicSortOrder,
            ).map((note) => (
              <li
                key={note.id}
                className="flex items-center justify-between py-2 border-b text-500"
              >
                <div>
                  <span className="block">
                    {note.title ?? '無題'}
                    <button
                      className="ml-2 p-1 rounded bg-transparent hover:bg-gray-200 transition"
                      onClick={() => toggleFavorite(note.id)}
                      aria-label="お気に入り"
                    >
                      {favoriteNoteIds.includes(note.id) ? (
                        <Star className="inline h-4 w-4 text-yellow-400" />
                      ) : (
                        <StarOff className="inline h-4 w-4 text-gray-400" />
                      )}                    </button>                  </span>                  <span className="block text-xs text-gray-400 mt-1">
                    作成者: {note.creator_name || 'Unknown User'}
                  </span>
                </div>
                <div>
                  {note.user_id === currentUser?.id ? (
                    <>
                      <button
                        className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded"
                        onClick={() => navigate(`/notes/${note.id}`)}
                      >
                        編集
                      </button>
                      <button
                        className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded"
                        onClick={() => handleDeletePublicNote(note.id)}
                      >
                        非表示
                      </button>
                      <button
                        className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded"
                        onClick={() => navigate(`/public/${note.id}`)}
                      >
                        閲覧
                      </button>
                    </>
                  ) : (
                    <button
                      className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded"
                      onClick={() => navigate(`/public/${note.id}`)}
                    >
                      閲覧
                    </button>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>

        {/* お気に入りノート一覧 */}
        <h3 className="mt-8 mb-2 font-bold">お気に入り</h3>
        <ul>          {favoriteNoteIds
            .map((id) => publicNotes.find((note) => note.id === id))
            .filter((note): note is NoteWithCreator => !!note).length === 0 ? (
            <li className="text-gray-400 italic py-2">
              お気に入りがありません
            </li>          ) : (            favoriteNoteIds
              .map((id) => publicNotes.find((note) => note.id === id))
              .filter((note): note is NoteWithCreator => !!note)
              .map((note) => (
                <li
                  key={note.id}
                  className="flex items-center justify-between py-2 border-b"
                >
                  <div>                    <span className="block">{note.title ?? '無題'}</span>                    <span className="block text-xs text-gray-400 mt-1">
                      作成者: {note.creator_name || 'Unknown User'}
                    </span>
                  </div>
                  <div>
                    <button
                      className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded"
                      onClick={() => navigate(`/public/${note.id}`)}
                    >
                      閲覧
                    </button>
                    <button
                      className="ml-2 p-1 rounded bg-transparent hover:bg-gray-200 transition"
                      onClick={() => toggleFavorite(note.id)}
                      aria-label="お気に入り解除"
                    >
                      <Star className="inline h-4 w-4 text-yellow-400" />
                    </button>
                  </div>
                </li>
              ))
          )}
        </ul>
      </CardContent>
      
      {/* 共有モーダル */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShare}
        noteTitle={selectedNote?.title ?? ''}
      />
    </Card>
  );
}
