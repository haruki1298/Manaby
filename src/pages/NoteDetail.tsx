import Editor from '@/components/Editor';
import { TitleInput } from '@/components/TitleInput';
import { CollaboratorModal } from '@/components/CollaboratorModal';
import { ShareModal } from '@/components/ShareModal';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { noteRepository } from '@/modules/notes/note.repository';
import { useNoteStore } from '@/modules/notes/note.state';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Share, Mail } from 'lucide-react';

const NoteDetail = () => {
  const params = useParams();  const id = parseInt(params.id!);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useCurrentUserStore();  const noteStore = useNoteStore();
  const note = noteStore.getOne(id);
  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  useEffect(() => {
    fetchOne();
    initializeCollaborativeEditing();
  }, [id]);
    const fetchOne = async () => {
    setIsLoading(true);
    try {
      // まず所有者として取得を試行
      let note = await noteRepository.findOne(currentUser!.id, id);
      
      // 所有者でない場合は、共同編集者として取得を試行
      if (note == null) {
        // 共同編集者用の取得メソッドを使用
        note = await noteRepository.findOneForCollaborator(id, currentUser!.id);
      }
      
      if (note == null) {
        // アクセス権限がない場合
        setIsLoading(false);
        return;
      }
      
      noteStore.set([note]);
    } catch (error) {
      console.error('Failed to fetch note:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const initializeCollaborativeEditing = async () => {
    if (!currentUser) return;

    console.log('Checking edit permissions for user:', currentUser.id, 'note:', id);
    
    // 編集権限をチェック
    const canEditNote = await noteRepository.canEditNote(currentUser.id, id);
    console.log('Can edit note:', canEditNote);
    setCanEdit(canEditNote);    // 編集セッションを作成
    if (canEditNote) {
      try {
        // ユーザーIDを文字列として渡す（メールアドレスの場合もあるため）
        const userIdForSession = currentUser.email || currentUser.id;
        const session = await noteRepository.createEditSession(id, userIdForSession);
        setEditSessionId(session.id);
      } catch (error) {
        console.error('Failed to create edit session:', error);
        // 編集セッション作成に失敗してもノート編集は続行
        // 一時的に空の編集セッションIDを設定
        setEditSessionId('temp-session-' + Date.now());
      }
    }

    // リアルタイム監視を設定
    const channel = supabase
      .channel(`note-collaboration-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${id}`,
        },
        (payload: any) => {
          if (payload.eventType === 'UPDATE') {
            // ノートの内容が他のユーザーによって更新された場合
            noteStore.set([payload.new]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'note_edit_sessions',
          filter: `note_id=eq.${id}`,
        },
        async () => {
          // アクティブユーザーの更新
          try {
            const sessions = await noteRepository.getActiveEditSessions(id);
            setActiveUsers(sessions || []);
          } catch (error) {
            console.error('Failed to fetch active sessions:', error);
          }
        }
      )
      .subscribe();

    // クリーンアップ
    return () => {
      if (editSessionId) {
        noteRepository.deleteEditSession(editSessionId);
      }
      supabase.removeChannel(channel);
    };
  };

  const updataNote = async (
    id: number,
    note: { title?: string; content?: string }
  ) => {
    const updataNote = await noteRepository.updata(id, note);
    if(updataNote == null) return;
    noteStore.set([updataNote]);
    return updataNote;
  };  const handleShareByEmail = async (email: string) => {
    try {
      await noteRepository.shareNoteByEmail(id, email, 'write');
      setIsShareModalOpen(false);
      alert(`${email} にノートを共有しました`);
    } catch (error) {
      console.error('共有エラー:', error);
      alert('共有に失敗しました: ' + (error as Error).message);
    }
  };

  if(isLoading) return <div />;
  if(note == null) return <div>note is not existed</div>;
  console.log(note);
  return (
    <div className="pb-40 pt-20">
      <div className="md:max-w-3xl lg:md-max-w-4xl mx-auto">
        {/* ヘッダー部分 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {activeUsers.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{activeUsers.length}人が編集中</span>
              </div>
            )}
          </div>
            <div className="flex gap-2">
            {note?.user_id === currentUser?.id && (
              <>
                <button
                  onClick={() => setIsCollaboratorModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <Share className="h-4 w-4" />
                  共同編集者
                </button>
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <Mail className="h-4 w-4" />
                  メール共有
                </button>
              </>
            )}
          </div>
        </div>

        <TitleInput 
          initialData={note} 
          onTitleChange={canEdit ? (title) => updataNote(id, { title }) : () => {}}
          readOnly={!canEdit}
        />
        <Editor 
          initialContent={note.content}
          onChange={canEdit ? (content) => updataNote(id, { content }) : () => {}}
          readOnly={!canEdit}
        />

        {!canEdit && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
            このノートは閲覧専用です。編集権限がありません。
          </div>
        )}
      </div>      {/* 共同編集者管理モーダル */}
      <CollaboratorModal
        isOpen={isCollaboratorModalOpen}
        onClose={() => setIsCollaboratorModalOpen(false)}
        noteId={id}
        isOwner={note?.user_id === currentUser?.id}
      />

      {/* メール共有モーダル */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShareByEmail}
        noteTitle={note?.title ?? '無題'}
      />
    </div>
  );
};

export default NoteDetail;
