import Editor from '@/components/Editor';
import { TitleInput } from '@/components/TitleInput';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { noteRepository } from '@/modules/notes/note.repository';
import { useNoteStore } from '@/modules/notes/note.state';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NoteDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();  const id = parseInt(params.id!);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useCurrentUserStore();  const noteStore = useNoteStore();
  const note = noteStore.getOne(id);
  const [canEdit, setCanEdit] = useState(true);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // レスポンシブ検知
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  useEffect(() => {
    fetchOne();
    initializeCollaborativeEditing();
    
    // 閲覧数を増加（デバウンス機能付き）
    const incrementViews = async () => {
      try {
        await noteRepository.incrementViews(id);
      } catch (error) {
        console.error('Failed to increment views:', error);
      }
    };
    
    // 初回読み込み時のみ閲覧数を増加
    const timeout = setTimeout(incrementViews, 1000);
    
    return () => clearTimeout(timeout);
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
  };

  if(isLoading) return <div />;
  if(note == null) return <div>note is not existed</div>;
  console.log(note);
  return (
    <div className="min-h-screen pb-20 pt-4 md:pb-40 md:pt-20">
      <div className="w-full max-w-full md:max-w-3xl lg:max-w-4xl mx-auto px-3 md:px-4 lg:px-6">
        {/* ヘッダー部分 */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 md:mb-4 gap-2">
          <div className="flex items-center gap-2">
            {/* モバイル用戻るボタン */}
            {isMobile && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 mr-2"
                aria-label="戻る"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            {activeUsers.length > 0 && (
              <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                <span>{activeUsers.length}{t('notes.editing')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <TitleInput 
            initialData={note} 
            onTitleChange={canEdit ? (title) => updataNote(id, { title }) : () => {}}
            readOnly={!canEdit}
          />
        </div>
        
        <div className="mb-4">
          <Editor 
            initialContent={note.content}
            onChange={canEdit ? (content) => updataNote(id, { content }) : () => {}}
            readOnly={!canEdit}
          />
        </div>

        {!canEdit && (
          <div className="mt-3 md:mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded text-yellow-800 dark:text-yellow-200 text-xs md:text-sm">
            {t('notes.readOnly')}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteDetail;
