// src/pages/PublicNote.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { noteRepository } from "@/modules/notes/note.repository";
import Editor from "@/components/Editor";
import { useTranslation } from "react-i18next";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentList } from "@/components/comments/CommentList";
import type { CommentType, UserProfile } from '@/types/comment'; // パスを確認

// ノートの型 (プロジェクトに合わせて調整)
interface NoteData {
  id: number;
  title: string | null;
  content: string | null;
  created_at: string;
  creator_name: string; // noteRepositoryから返されることを想定
}

// ダミーの現在のユーザー情報 (ログイン状態を模倣)
const DUMMY_CURRENT_USER: UserProfile | null = {
  id: 'user-dummy-current-123', // このIDは固定
  full_name: 'テストユーザー ☆',
  avatar_url: 'https://via.placeholder.com/40/800080/FFFFFF?Text=T',
};
// const DUMMY_CURRENT_USER = null; // 未ログイン状態をテストする場合


const PublicNote = () => {
  const { t } = useTranslation();
  const params = useParams();
  const idFromParams = parseInt(params.id!);
  const [note, setNote] = useState<NoteData | null>(null);

  // コメント機能用のstate
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // コメントの階層化ヘルパー関数
  const buildCommentTree = (flatComments: CommentType[]): CommentType[] => {
    const commentMap: { [id: string]: CommentType } = {};
    const topLevelComments: CommentType[] = [];
    flatComments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });
    flatComments.forEach(comment => {
      if (comment.parent_comment_id && commentMap[comment.parent_comment_id]) {
        const parentComment = commentMap[comment.parent_comment_id];
        if (!parentComment.replies) { parentComment.replies = []; }
        parentComment.replies.push(commentMap[comment.id]);
      } else {
        topLevelComments.push(commentMap[comment.id]);
      }
    });
    return topLevelComments;
  };

  useEffect(() => {
    if (idFromParams && !isNaN(idFromParams)) {
      fetchNote(idFromParams);
      fetchDummyComments(idFromParams);
    }
  }, [idFromParams]);

  const fetchNote = async (currentNoteId: number) => {
    // 動作確認のため、noteRepositoryがエラーを出す場合はダミーに切り替える
    try {
        const noteData = await noteRepository.getPublicNoteWithCreator(currentNoteId);
        setNote(noteData as NoteData || null);
    } catch (error) {
        console.error("Failed to fetch note from repository, using dummy data.", error);
        const dummyNoteData: NoteData = {
            id: currentNoteId,
            title: `ノート ${currentNoteId} (Dummy)`,
            content: JSON.stringify([{ type: "paragraph", content: [{ type: "text", text: `これはノートID: ${currentNoteId} のダミーコンテンツです。` }] }]),
            created_at: new Date(Date.now() - 86400000).toISOString(),
            creator_name: "ダミー作成者"
        };
        setNote(dummyNoteData);
    }
  };

  const fetchDummyComments = (currentNoteId: number) => {
    setIsLoadingComments(true);
    setTimeout(() => {
      const dummyFlatComments: CommentType[] = [
        { id: 'dc-1', note_id: currentNoteId, user_id: 'user-alice', parent_comment_id: null, user: { id: 'user-alice', full_name: 'Alice (Dummy)' }, content: 'これはノートID ' + currentNoteId + ' への最初のダミーコメントです。', created_at: new Date(Date.now() - 300000).toISOString() },
        { id: 'dc-2', note_id: currentNoteId, user_id: 'user-bob', parent_comment_id: 'dc-1', user: { id: 'user-bob', full_name: 'Bob (Dummy)' }, content: 'アリスさんのコメントへの返信です。', created_at: new Date(Date.now() - 200000).toISOString() },
        { id: 'dc-3', note_id: currentNoteId, user_id: null, parent_comment_id: null, user: null, content: 'これは匿名のダミーコメントです。', created_at: new Date().toISOString() },
        { id: 'dc-4', note_id: currentNoteId, user_id: DUMMY_CURRENT_USER?.id || 'unknown-user', parent_comment_id: 'dc-2', user: DUMMY_CURRENT_USER, content: 'ボブさんへの返信です。（ログインユーザーより）', created_at: new Date(Date.now() - 10000).toISOString() },
      ];
      const filteredComments = dummyFlatComments.filter(c => c.note_id === currentNoteId);
      const commentTree = buildCommentTree(filteredComments);
      setComments(commentTree);
      setIsLoadingComments(false);
    }, 300);
  };

  const handlePostDummyComment = async (content: string, parentIdToReply?: string): Promise<boolean> => {
    if (!DUMMY_CURRENT_USER) {
      alert(t('comments.loginRequiredForPost', 'コメントするにはログインが必要です（ダミー表示）'));
      return false;
    }
    if (!content.trim()) {
      alert(t('comments.contentRequired', 'コメント内容を入力してください。'));
      return false;
    }
    setIsSubmittingComment(true);
    const newComment: CommentType = {
        id: `dummy-c-${Date.now()}`,
        note_id: idFromParams,
        user_id: DUMMY_CURRENT_USER.id,
        parent_comment_id: parentIdToReply || null,
        content: content,
        created_at: new Date().toISOString(),
        user: DUMMY_CURRENT_USER,
    };
    return new Promise(resolve => {
      setTimeout(() => {
        if (parentIdToReply) {
          const addReplyRecursive = (commentsArr: CommentType[], targetParentId: string, replyToAdd: CommentType): CommentType[] => {
            return commentsArr.map(c => {
              if (c.id === targetParentId) { return { ...c, replies: [...(c.replies || []), replyToAdd] }; }
              if (c.replies && c.replies.length > 0) { return { ...c, replies: addReplyRecursive(c.replies, targetParentId, replyToAdd) }; }
              return c;
            });
          };
          setComments(prev => addReplyRecursive(prev, parentIdToReply, newComment));
        } else {
          setComments(prev => [newComment, ...prev]);
        }
        setReplyingToCommentId(null);
        setIsSubmittingComment(false);
        resolve(true);
      }, 300);
    });
  };

  const handleReplyClick = (commentId: string) => { setReplyingToCommentId(commentId); const el = document.getElementById('comment-form-textarea'); if (el) el.focus(); };
  const handleCancelReply = () => { setReplyingToCommentId(null); };

  const handleEditDummyComment = (commentToEdit: CommentType) => {
    if (!DUMMY_CURRENT_USER || DUMMY_CURRENT_USER.id !== commentToEdit.user_id) {
        alert(t('comments.cannotEditOthers', '自分のコメントのみ編集できます。（ダミー）'));
        return;
    }
    const newContent = prompt("新しいコメント内容を入力してください:", commentToEdit.content);
    if (newContent !== null && newContent.trim() !== "") {
      const editCommentRecursive = (commentsArr: CommentType[], targetId: string, updatedContent: string): CommentType[] => {
        return commentsArr.map(c => {
          if (c.id === targetId) { return { ...c, content: updatedContent }; }
          if (c.replies && c.replies.length > 0) { return { ...c, replies: editCommentRecursive(c.replies, targetId, updatedContent) }; }
          return c;
        });
      };
      setComments(prev => editCommentRecursive(prev, commentToEdit.id, newContent));
      alert("コメントを編集しました。（ダミー）");
    }
  };

  const handleDeleteDummyComment = (commentIdToDelete: string) => {
    if (!DUMMY_CURRENT_USER) {
      alert(t('comments.loginRequiredForDelete', 'コメントを削除するにはログインが必要です。（ダミー）'));
      return;
    }
    const commentToDelete = findCommentById(comments, commentIdToDelete);
    if (commentToDelete && commentToDelete.user_id !== DUMMY_CURRENT_USER.id) {
       alert(t('comments.cannotDeleteOthers', '自分のコメントのみ削除できます。（ダミー）'));
       return;
    }
    const confirmed = window.confirm(t('comments.confirmDelete', 'このダミーコメントを削除しますか？\n(このコメントへの返信もすべてUIから消えます)'));
    if (confirmed) {
      setIsSubmittingComment(true);
      setTimeout(() => {
        const removeCommentRecursive = (commentsArr: CommentType[], idToRemove: string): CommentType[] => {
          return commentsArr
            .filter(c => c.id !== idToRemove)
            .map(c => ({ ...c, replies: c.replies ? removeCommentRecursive(c.replies, idToRemove) : [] }));
        };
        setComments(prev => removeCommentRecursive(prev, commentIdToDelete));
        setIsSubmittingComment(false);
      }, 300);
    }
  };

  const findCommentById = (commentsArr: CommentType[], idToFind: string): CommentType | null => {
    for (const comment of commentsArr) {
        if (comment.id === idToFind) return comment;
        if (comment.replies) {
            const foundInReplies = findCommentById(comment.replies, idToFind);
            if (foundInReplies) return foundInReplies;
        }
    }
    return null;
  };

  if (!note) return <div>{t('notes.notFound', 'ノートを読み込み中...')}</div>;

  return (
    <div className="pb-40 pt-20 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">{note.title ?? t('notes.untitled')}</h1>
        <div className="mb-4 text-gray-600 dark:text-gray-400 text-sm">
          {t('notes.creator', '作成者')}: {note.creator_name} | {t('notes.createdDate', '作成日')}: {new Date(note.created_at).toLocaleDateString('ja-JP')}
        </div>
        <Editor initialContent={note.content} onChange={() => {}} readOnly key={note.id} />
        <div className="mt-4 text-gray-500 dark:text-gray-400 text-sm">{t('notes.readOnlyNote')}</div>

        {/* コメントセクション */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-2xl font-semibold mb-6">{t('comments.title', 'コメント')}</h2>
          {DUMMY_CURRENT_USER ? (
            <CommentForm
              onSubmit={handlePostDummyComment}
              parentId={replyingToCommentId}
              onCancelReply={replyingToCommentId ? handleCancelReply : undefined}
              isSubmitting={isSubmittingComment}
            />
          ) : (
            <div className="p-4 mb-6 border rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-center">
              {t('comments.loginRequired', 'コメントを投稿するにはログインが必要です。')}
            </div>
          )}

          {isLoadingComments ? (
            <p className="text-gray-500 dark:text-gray-400">{t('comments.loading', 'コメントを読み込み中...')}</p>
          ) : comments.length > 0 ? (
            <CommentList
              comments={comments}
              onReply={handleReplyClick}
              onEdit={handleEditDummyComment}
              onDelete={handleDeleteDummyComment}
            />
          ) : (
            <p className="text-gray-500 dark:text-gray-400">{t('comments.noComments', 'まだコメントはありません。')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicNote;