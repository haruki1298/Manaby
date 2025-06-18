import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { noteRepository } from '@/modules/notes/note.repository';
import { useNoteStore } from '@/modules/notes/note.state';
import { Plus, Star, StarOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShareModal } from '@/components/ShareModal';
import { Note } from '@/modules/notes/note.entity'; // Note型が必要な場合

export function Home() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
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

  useEffect(() => {
    fetchPublicNotes();
  }, []);

  // お気に入り情報をローカルストレージから取得
  useEffect(() => {
    const stored = localStorage.getItem('favoriteNoteIds');
    if (stored) setFavoriteNoteIds(JSON.parse(stored));
  }, []);

  const createNote = async () => {
    const newNote = await noteRepository.create(currentUser!.id, { title });
    noteStore.set([newNote]);
    setTitle('');
    navigate(`/notes/${newNote.id}`);
  };

  // 共有ボタン押下時
  const handleShareClick = (note: Note) => {
    setSelectedNote(note);
    setIsShareModalOpen(true);
  };

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

  const getPublicNoteUrl = (noteId: number) => {
    return `${window.location.origin}/public/${noteId}`;
  };

  return (
    <Card className="border-0 shadow-none w-1/2 m-auto">
      <CardHeader className="px-4 pb-3">
        <CardTitle className="text-lg font-medium">
          新しいノートを作成してみましょう
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex gap-2 mb-4">
          <input
            className="h-9 flex-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
            placeholder="ノートのタイトルを入力"
            type="text"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
          <button
            className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={createNote}
          >
            <Plus className="h-4 w-4" />
            <span className="ml-1">ノート作成</span>
          </button>
        </div>
        {/* ノート一覧と共有ボタン */}
        <ul>
          <li className="font-bold text-primary-300 mb-2">未公開ノート</li>
          {notes.filter((note) => !note.is_public).length === 0 ? (
            <li className="text-gray-400 italic py-2">ノートがないです</li>
          ) : (
            notes
              .filter((note) => !note.is_public)
              .map((note) => (
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
                      disabled={note.is_public}
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
            )
          }
        
        </ul>
        {/* お気に入りノート一覧 */}
        <h3 className="mt-8 mb-2 font-bold">お気に入り</h3>
        <ul>
          {publicNotes.filter(note => favoriteNoteIds.includes(note.id)).length === 0 ? (
            <li className="text-gray-400 italic py-2">お気に入りがありません</li>
          ) : (
            publicNotes
              .filter(note => favoriteNoteIds.includes(note.id))
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
        {/* 公開ノート一覧 */}
        <h3 className="mt-8 mb-2 font-bold">公開ノート</h3>
        <ul>
          {publicNotes.length === 0 ? (
            <li className="text-gray-400 italic py-2">ノートがありません</li>
          ) : (
            publicNotes.map((note) => (
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
