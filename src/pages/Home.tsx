import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { noteRepository } from '@/modules/notes/note.repository';
import { useNoteStore } from '@/modules/notes/note.state';
import { Note } from '@/modules/notes/note.entity'; // Note型に created_at, viewCount 等のプロパティがあると仮定
import { Plus } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShareModal } from '@/components/ShareModal';

// SortDropdown 用の型定義
interface SortDropdownOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  options: SortDropdownOption[];
}

const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={onChange}
    className="h-9 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500"
  >
    {options.map((opt: SortDropdownOption) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

export function Home() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const { currentUser } = useCurrentUserStore();
  const noteStore = useNoteStore();

  // 共有モーダル用の状態
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  // 公開ノート用の状態
  const [publicNotes, setPublicNotes] = useState<Note[]>([]);

  // ソート条件（未公開・公開ノート用）
  const [privateSort, setPrivateSort] = useState('created_at-desc');
  const [publicSort, setPublicSort] = useState('created_at-desc');

  useEffect(() => {
    fetchPublicNotes();
  }, []);

  const createNote = async () => {
    const newNote = await noteRepository.create(currentUser!.id, { title });
    noteStore.set([newNote]);
    setTitle('');
    navigate(`/notes/${newNote.id}`);
  };


  const fetchPublicNotes = async () => {
    const notes = await noteRepository.findPublicNotes();
    setPublicNotes(notes ?? []);
  };

  const handleDeletePublicNote = async (noteId: number) => {
    await noteRepository.setPublic(noteId, false);
    fetchPublicNotes();
    const updated = noteStore.getAll().map((n) =>
      n.id === noteId ? { ...n, is_public: false } : n
    );
    noteStore.set(updated);
  };

  // 未公開ノートを公開するための関数
  const handlePublishNote = async (noteId: number) => {
    await noteRepository.setPublic(noteId, true);
    fetchPublicNotes();
    const updated = noteStore.getAll().map((n) =>
      n.id === noteId ? { ...n, is_public: true } : n
    );
    noteStore.set(updated);
  };


  function handleShare(email: string): void {
    // ... 共有処理の実装（省略） ...
  }

  const notes = noteStore.getAll();

  // ソート用のオプションに「閲覧数」を追加
  const sortOptions: SortDropdownOption[] = [
    { value: 'created_at-desc', label: '作成日が新しい順' },
    { value: 'created_at-asc', label: '作成日が古い順' },
  ];

  // 未公開ノートのソート（タイプが number の場合は数値比較）
  const sortedPrivateNotes = useMemo(() => {
    const [key, direction] = privateSort.split('-') as [keyof Note, 'asc' | 'desc'];
    const filtered = notes.filter((note) => !note.is_public);
    return [...filtered].sort((a, b) => {
      const valA = a[key];
      const valB = b[key];
      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else {
        const strA = (valA ?? '').toString();
        const strB = (valB ?? '').toString();
        if (strA > strB) comparison = 1;
        else if (strA < strB) comparison = -1;
      }
      return direction === 'desc' ? comparison * -1 : comparison;
    });
  }, [notes, privateSort]);

  // 公開ノートのソート（同様に閲覧数も考慮）
  const sortedPublicNotes = useMemo(() => {
    const [key, direction] = publicSort.split('-') as [keyof Note, 'asc' | 'desc'];
    return [...publicNotes].sort((a, b) => {
      const valA = a[key];
      const valB = b[key];
      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else {
        const strA = (valA ?? '').toString();
        const strB = (valB ?? '').toString();
        if (strA > strB) comparison = 1;
        else if (strA < strB) comparison = -1;
      }
      return direction === 'desc' ? comparison * -1 : comparison;
    });
  }, [publicNotes, publicSort]);

  function fetchPrivateNotes() {
    throw new Error('Function not implemented.');
  }

  return (
    <Card className="border-0 shadow-none w-1/2 m-auto">
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          新しいノートを作成してみましょう
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <input
            className="h-9 flex-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 text-sm"
            placeholder="ノートのタイトルを入力"
            type="text"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          />
          <button
            className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={createNote}
          >
            <Plus className="h-4 w-4" />
            <span className="ml-1">ノート作成</span>
          </button>
        </div>

        {/* 未公開ノートリストヘッダー */}
        <div className="flex justify-between items-center mb-2 mt-4">
          <h3 className="font-bold text-primary-300">未公開ノート</h3>
          <SortDropdown 
            value={privateSort}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPrivateSort(e.target.value)}
            options={sortOptions}
          />
        </div>
        {/* 未公開ノート一覧 */}
        <ul>
          {sortedPrivateNotes.length === 0 ? (
            <li className="text-gray-400 italic py-2">ノートがないです</li>
          ) : (
            sortedPrivateNotes.map((note) => (
              <li key={note.id} className="flex items-center justify-between py-2 border-b">
                <div>
                  <span className="block">{note.title ?? '無題'}</span>
                  <span className="block text-xs text-gray-400 mt-1">
                    作成日時: {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex">
                  {/* 未公開ノートには編集・公開・削除ボタンを表示 */}
                  <button
                    className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded"
                    onClick={() => navigate(`/notes/${note.id}`)}
                  >
                    編集
                  </button>
                  <button
                    className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded"
                    onClick={async () => {
                      await noteRepository.setPublic(note.id, true);
                      fetchPrivateNotes();
                      fetchPublicNotes();
                    }}
                  >
                    公開
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

        {/* 公開ノートリストヘッダー */}
        <div className="flex justify-between items-center mt-8 mb-2">
          <h3 className="font-bold">公開ノート</h3>
          <SortDropdown 
            value={publicSort}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPublicSort(e.target.value)}
            options={sortOptions}
          />
        </div>
        {/* 公開ノート一覧 */}
        <ul>
          {sortedPublicNotes.length === 0 ? (
            <li className="text-gray-400 italic py-2">ノートがありません</li>
          ) : (
            sortedPublicNotes.map((note) => (
              <li key={note.id} className="flex items-center justify-between py-2 border-b text-500">
                <div>
                  <span className="block">{note.title ?? '無題'}</span>
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
                        disabled={!note.is_public}
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
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShare}
        noteTitle={selectedNote?.title ?? ''}
      />
    </Card>
  );
}

export default Home;
