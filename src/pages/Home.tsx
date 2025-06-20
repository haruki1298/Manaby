import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { noteRepository } from '@/modules/notes/note.repository';
import { useNoteStore } from '@/modules/notes/note.state';
import { Star, StarOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShareModal } from '@/components/ShareModal';
import { Note } from '@/modules/notes/note.entity'; // Note型が必要な場合

type SortKey = 'created_at' | 'views';

export function Home() {
  const navigate = useNavigate();
  const [] = useState('');
  const { currentUser } = useCurrentUserStore();
  const noteStore = useNoteStore();

  // 追加: 共有モーダル用の状態
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // 公開ノート用の状態
  const [publicNotes, setPublicNotes] = useState<Note[]>(
    [] // 初期値は空の配列
  );

  // お気に入りノートIDの配列
  const [favoriteNoteIds, setFavoriteNoteIds] = useState<number[]>([]);

  // 並び替えキーと順序の状態
  const [] = useState<SortKey>('created_at');
  const [] = useState<'asc' | 'desc'>('desc'); // 降順がデフォルト
  // 未公開ノート用
  const [privateSortKey, setPrivateSortKey] = useState<SortKey>('created_at');
  const [privateSortOrder, setPrivateSortOrder] = useState<'asc' | 'desc'>('desc');
  // 公開ノート用
  const [publicSortKey, setPublicSortKey] = useState<SortKey>('created_at');
  const [publicSortOrder, setPublicSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchPublicNotes();
  }, []);

  // お気に入り情報をローカルストレージから取得
  useEffect(() => {
    const stored = localStorage.getItem('favoriteNoteIds');
    if (stored) setFavoriteNoteIds(JSON.parse(stored));
  }, []);


  // 共有ボタン押下時

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
  const notes = noteStore.getAll();

  // 公開ノート取得
  const fetchPublicNotes = async () => {
    const notes = await noteRepository.findPublicNotes();
    setPublicNotes(notes ?? []);
  };

  // 公開ノート削除
  const handleDeletePublicNote = async (noteId: number) => {
    await noteRepository.setPublic(noteId, false); // 公開解除（未公開に戻す）
    fetchPublicNotes();
    // 必要なら noteStore の該当ノートも更新
    const updated = notes.map((note) =>
      note.id === noteId ? { ...note, is_public: false } : note
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
      ? favoriteNoteIds.filter(id => id !== noteId)
      : [...favoriteNoteIds, noteId];
    saveFavorites(updated);
  };


  // 並び替え関数
  const getSortedNotes = (
    notes: Note[],
    sortKey: SortKey,
    sortOrder: 'asc' | 'desc'
  ) => {
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

  return (
    <Card className="border-0 shadow-none w-1/2 m-auto">
      <CardHeader className="px-4 pb-3">
        <CardTitle className="text-lg font-medium">
          新しいノートを作成してみましょう
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {/* 未公開ノート */}
        <div className="flex gap-2 mb-2 items-center">
          <span className="font-bold text-primary-300">未公開ノート</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={privateSortKey}
            onChange={e => setPrivateSortKey(e.target.value as SortKey)}
          >
            <option value="created_at">作成日</option>
            <option value="views">閲覧数</option>
          </select>
          <button
            className="border rounded px-2 py-1 text-sm"
            onClick={() => setPrivateSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
          >
            {privateSortOrder === 'asc' ? '昇順' : '降順'}
          </button>
        </div>
        <ul>
          {getSortedNotes(
            notes.filter(note => !note.is_public),
            privateSortKey,
            privateSortOrder
          ).length === 0 ? (
            <li className="text-gray-400 italic py-2">ノートがないです</li>
          ) : (
            getSortedNotes(
              notes.filter(note => !note.is_public),
              privateSortKey,
              privateSortOrder
            ).map(note => (
              <li key={note.id} className="flex items-center justify-between py-2 border-b">
                <span>
                  {note.title ?? '無題'}
                </span>
                <div>
                  <button
                    className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded"
                    onClick={async () => {
                      await noteRepository.setPublic(note.id, true); // ←公開処理
                      fetchPublicNotes(); // 公開ノート一覧を再取得
                    }}
                    disabled={note.is_public ?? false}
                  >
                    {note.is_public ? "公開中" : "公開"}
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
        {/* お気に入りノート一覧 */}
        <h3 className="mt-8 mb-2 font-bold">お気に入り</h3>
        <ul>
          {favoriteNoteIds
            .map(id => publicNotes.find(note => note.id === id))
            .filter((note): note is Note => !!note).length === 0 ? (
            <li className="text-gray-400 italic py-2">お気に入りがありません</li>
          ) : (
            favoriteNoteIds
              .map(id => publicNotes.find(note => note.id === id))
              .filter((note): note is Note => !!note)
              .map(note => (
                <li key={note.id} className="flex items-center justify-between py-2 border-b">
                  <span>{note.title ?? '無題'}</span>
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
        {/* 公開ノート */}
        <div className="flex gap-2 mt-8 mb-2 items-center">
          <span className="font-bold">公開ノート</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={publicSortKey}
            onChange={e => setPublicSortKey(e.target.value as SortKey)}
          >
            <option value="created_at">作成日</option>
            <option value="views">閲覧数</option>
          </select>
          <button
            className="border rounded px-2 py-1 text-sm"
            onClick={() => setPublicSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
          >
            {publicSortOrder === 'asc' ? '昇順' : '降順'}
          </button>
        </div>
        <ul>
          {getSortedNotes(
            publicNotes,
            publicSortKey,
            publicSortOrder
          ).length === 0 ? (
            <li className="text-gray-400 italic py-2">ノートがありません</li>
          ) : (
            getSortedNotes(
              publicNotes,
              publicSortKey,
              publicSortOrder
            ).map(note => (
              <li key={note.id} className="flex items-center justify-between py-2 border-b text-500">
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
                      )}
                    </button>
                  </span>
                  <span className="block text-xs text-gray-400 mt-1">
                    作成者: {note.user_id}
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
