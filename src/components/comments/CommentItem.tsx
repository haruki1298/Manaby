// src/components/comments/CommentItem.tsx
//import React from 'react';
import type { CommentType } from '@/types/comment'; 
import { useCurrentUserStore } from '@/modules/auth/current-user.state'; 

interface CommentItemProps {
  comment: CommentType;
  onReply: (commentId: string) => void;
  onEdit?: (commentToEdit: CommentType) => void;
  onDelete?: (commentIdToDelete: string) => void;
}

export function CommentItem({ comment, onReply, onEdit, onDelete }: CommentItemProps) {
  const { currentUser } = useCurrentUserStore();
  const isOwnComment = currentUser && comment.user_id && currentUser.id === comment.user_id;

  const { user, content, created_at, replies, id: commentId } = comment;

  const handleEdit = () => { if (onEdit) onEdit(comment); };
  const handleDelete = () => { if (onDelete) onDelete(commentId); };

  return (
    <div className="flex space-x-3">
      <div className="flex-shrink-0">
        {/* アバターはまだないので、頭文字を表示 */}
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-semibold text-gray-500 dark:text-gray-400">
          {(user?.display_name || 'A').charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="flex-1">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {user?.display_name || '匿名ユーザー'}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(created_at).toLocaleString('ja-JP')}
              </p>
              {isOwnComment && (
                <div className="flex items-center">
                  {onEdit && <button onClick={handleEdit} className="p-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-200">編集</button>}
                  {onEdit && onDelete && <span className="mx-1 text-gray-400">·</span>}
                  {onDelete && <button onClick={handleDelete} className="p-1 text-xs text-red-500 hover:text-red-700">削除</button>}
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap">{content}</p>
        </div>
        <div className="mt-1">
          <button onClick={() => onReply(commentId)} className="text-xs text-blue-600 hover:underline dark:text-blue-400">
            返信する
          </button>
        </div>
        {replies && replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            {replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} onReply={onReply} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}