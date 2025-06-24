import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { noteRepository } from '@/modules/notes/note.repository';
import { useNoteStore } from '@/modules/notes/note.state';
import { Plus } from 'lucide-react';
import { useState } from 'react';
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
          {notes.map((note) => (
            <li key={note.id} className="flex items-center justify-between py-2 border-b">
              <span>{note.title ?? '無題'}</span>
              <button
                className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded"
                onClick={() => handleShareClick(note)}
              >
                共有
              </button>
            </li>
          ))}
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
