import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { noteRepository } from "@/modules/notes/note.repository";
import Editor from "@/components/Editor";
import { useTranslation } from "react-i18next";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentList } from "@/components/comments/CommentList";
import { supabase } from '@/lib/supabase';
import type { Database } from '../../database.types'; 
import type { CommentType, UserProfile } from '@/types/comment';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';

type NoteRow = Database['public']['Tables']['notes']['Row'];
type CommentRow = Database['public']['Tables']['comments']['Row'];
type CommentInsert = Database['public']['Tables']['comments']['Insert'];
type CommentUpdate = Database['public']['Tables']['comments']['Update'];

interface NoteWithCreator extends NoteRow {}

const PublicNote = () => {
  const { t } = useTranslation();
  const params = useParams();
  const noteIdFromParams = parseInt(params.id!);
  const [note, setNote] = useState<NoteWithCreator | null>(null);

  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const { currentUser } = useCurrentUserStore();
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingComment, setEditingComment] = useState<CommentType | null>(null);

  const buildCommentTree = (flatComments: CommentRow[], currentNote: NoteWithCreator | null): CommentType[] => {
    const commentMap: { [id: string]: CommentType } = {};
    const topLevelComments: CommentType[] = [];

    flatComments.forEach(dbComment => {
      let userProfile: UserProfile | null = null;
      if (dbComment.user_id) {
        
        if (currentNote && dbComment.user_id === currentNote.user_id) {
          userProfile = {
            id: dbComment.user_id,
            display_name: currentNote.creator_name || `ユーザー (${dbComment.user_id.substring(0, 6)})`
          };
        } else {
          
          userProfile = {
            id: dbComment.user_id,
            display_name: `ユーザー (${dbComment.user_id.substring(0, 6)})`
          };
        }
      }

      commentMap[dbComment.id] = {
        id: dbComment.id,
        note_id: dbComment.note_id,
        user_id: dbComment.user_id,
        parent_comment_id: dbComment.parent_comment_id,
        content: dbComment.content,
        created_at: dbComment.created_at,
        user: userProfile,
        replies: []
      };
    });

    flatComments.forEach(dbComment => {
      const currentCommentInMap = commentMap[dbComment.id];
      if (dbComment.parent_comment_id && commentMap[dbComment.parent_comment_id]) {
        const parent = commentMap[dbComment.parent_comment_id];
        if (!parent.replies) { parent.replies = []; }
        parent.replies.push(currentCommentInMap);
      } else {
        topLevelComments.push(currentCommentInMap);
      }
    });
    return topLevelComments;
  };

  useEffect(() => {
    const initializePage = async () => {
      if (noteIdFromParams && !isNaN(noteIdFromParams)) {
        
        const noteData = await noteRepository.getPublicNoteWithCreator(noteIdFromParams);
        if (noteData) {
          const typedNoteData = noteData as NoteWithCreator;
          setNote(typedNoteData);
          
          fetchComments(noteIdFromParams, typedNoteData);
          
          // 閲覧数を増加（デバウンス機能付き）
          const incrementViews = async () => {
            try {
              await noteRepository.incrementViews(noteIdFromParams);
            } catch (error) {
              console.error('Failed to increment views:', error);
            }
          };
          
          // 初回読み込み時のみ閲覧数を増加
          setTimeout(incrementViews, 1000);
        } else {
          setNote(null);
        }
      }
    };
    initializePage();
  }, [noteIdFromParams]);

  const fetchComments = async (currentNoteId: number, currentNote: NoteWithCreator | null) => {
    setIsLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('note_id', currentNoteId)
        .eq('is_deleted', false)
        .eq('is_hidden_by_moderator', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error.message);
        setComments([]);
      } else if (data) {
        const commentTree = buildCommentTree(data, currentNote);
        setComments(commentTree);
      }
    } catch (e: any) {
      console.error('Unexpected error fetching comments:', e.message);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleCommentSubmit = async (content: string, parentIdToReply?: string): Promise<boolean> => {
    if (!noteIdFromParams || !note) { alert(t('errors.noteNotFound', 'エラー: ノート情報がありません')); return false; }
    if (!currentUser) { alert(t('comments.loginRequiredForPost', 'ログインが必要です')); return false; }
    if (!content.trim()) { alert(t('comments.contentRequired', 'コメントを入力してください')); return false; }

    setIsSubmittingComment(true);

    if (editingComment) {
      const commentUpdateData: CommentUpdate = {
        content: content,
        updated_at: new Date().toISOString(), 
      };
      try {
        const { error } = await supabase
          .from('comments')
          .update(commentUpdateData)
          .eq('id', editingComment.id)
          .eq('user_id', currentUser.id);

        if (error) { throw error; }

        await fetchComments(noteIdFromParams, note); 
        setEditingComment(null); 
        return true;
      } catch (e: any) {
        alert(`${t('comments.editFailed', '編集失敗')}: ${e.message}`);
        return false;
      } finally {
        setIsSubmittingComment(false);
      }
    }

   
    const newCommentData: CommentInsert = {
      note_id: noteIdFromParams,
      user_id: currentUser.id,
      content,
      parent_comment_id: parentIdToReply || null,
    };
    try {
      const { error } = await supabase.from('comments').insert(newCommentData);
      if (error) { throw error; }
      await fetchComments(noteIdFromParams, note);
      setReplyingToCommentId(null);
      return true;
    } catch (e: any) {
      alert(`${t('comments.postFailed', '投稿失敗')}: ${e.message}`);
      return false;
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReplyClick = (commentId: string) => {
    setEditingComment(null); 
    setReplyingToCommentId(commentId);
    const formElement = document.getElementById('comment-form-textarea');
    if (formElement) {
      formElement.focus();
    }
  };

  const handleCancelReply = () => {
    setReplyingToCommentId(null);
  };

  const handleEditComment = (commentToEdit: CommentType) => {
    setReplyingToCommentId(null); 
    setEditingComment(commentToEdit);
    const formElement = document.getElementById('comment-form-textarea');
    if (formElement) {
      formElement.focus();
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
  };

  const handleDeleteComment = async (commentIdToDelete: string) => {
    if (!currentUser || !note) { alert(t('errors.unexpected', 'エラーが発生しました')); return; }
    const confirmed = window.confirm(t('comments.confirmDelete', 'このコメントを削除しますか？'));
    if (confirmed) {
      setIsSubmittingComment(true);
      try {
        const { error } = await supabase.from('comments').update({ is_deleted: true }).eq('id', commentIdToDelete).eq('user_id', currentUser.id);
        if (error) {
          throw error;
        }
        await fetchComments(noteIdFromParams, note);
      } catch (e: any) {
        alert(`${t('comments.deleteFailed', '削除失敗')}: ${e.message}`);
      } finally {
        setIsSubmittingComment(false);
      }
    }
  };


  if (!note) return <div>{t('notes.loading', 'ノートを読み込み中...')}</div>;

  return (
    <div className="pb-40 pt-20 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">{note.title ?? t('notes.untitled', '無題')}</h1>
        <div className="mb-4 text-gray-600 dark:text-gray-400 text-sm">
          {t('notes.creator', '作成者')}: {note.creator_name || t('common.unknown', '不明')} | {t('notes.createdDate', '作成日')}: {new Date(note.created_at).toLocaleDateString('ja-JP')}
        </div>
        <Editor initialContent={note.content} onChange={() => {}} readOnly key={note.id} />
        <div className="mt-4 text-gray-500 dark:text-gray-400 text-sm">{t('notes.readOnlyNote', '※このノートは閲覧専用です')}</div>

        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-2xl font-semibold mb-6">
            {editingComment ? t('comments.editingTitle', 'コメントを編集中') : t('comments.title', 'コメント')}
          </h2>
          {currentUser ? (
            <CommentForm
              onSubmit={handleCommentSubmit}
              parentId={replyingToCommentId}
              onCancelReply={replyingToCommentId ? handleCancelReply : undefined}
              isSubmitting={isSubmittingComment}
              isEditing={!!editingComment}
              initialContent={editingComment ? editingComment.content : ''}
              onCancelEdit={editingComment ? handleCancelEdit : undefined}
            />
          ) : (
            <div className="p-4 mb-6 border rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-center">
              {t('comments.loginRequired', 'コメントを投稿するにはログインが必要です。')}
            </div>
          )}
          {isLoadingComments ? (
            <p>{t('comments.loading', 'コメントを読み込み中...')}</p>
          ) : comments.length > 0 ? (
            <CommentList
              comments={comments}
              onReply={handleReplyClick}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
            />
          ) : (
            <p>{t('comments.noComments', 'まだコメントはありません。')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicNote;