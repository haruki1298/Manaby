// src/components/comments/CommentItem.tsx
import React from 'react';
import type { CommentType } from '@/types/comment'; // パスが正しいか確認

interface CommentItemProps {
  comment: CommentType;
  onReply: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onEdit?: (commentToEdit: CommentType) => void;
}

export function CommentItem({ comment, onReply, onDelete, onEdit }: CommentItemProps) {
  const { user, content, created_at, replies, id: commentId } = comment;

  // ▼▼▼ 【変更】isOwnComment の判定を PublicNote.tsx の DUMMY_CURRENT_USER.id と一致させる ▼▼▼
  // このIDは PublicNote.tsx で定義したものと合わせてください。
  const isOwnComment = user && user.id === 'user-dummy-current-123';
  // ▲▲▲ 【変更】ここまで ▲▲▲

  const handleEdit = () => {
    if (onEdit) {
      onEdit(comment);
    }
  };

  // ▼▼▼ 【追加】削除ボタンがクリックされたときの処理 ▼▼▼
  const handleDelete = () => {
    if (onDelete) { // onDelete prop が渡されていれば実行
      onDelete(commentId); // コメントのIDを渡す
    }
  };
  // ▲▲▲ 【追加】ここまで ▲▲▲

  return (
    <div className="flex space-x-3">
      {/* アバター表示エリア */}
      <div className="flex-shrink-0">
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.full_name || 'User Avatar'}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-semibold text-gray-500 dark:text-gray-400">
            {(user?.full_name || 'A').charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* コメント内容表示エリア */}
      <div className="flex-1">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {user?.full_name || '匿名ユーザー'}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(created_at).toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {isOwnComment && (
                <div className="flex items-center">
                  {onEdit && (
                    <button
                      onClick={handleEdit}
                      className="p-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      aria-label="コメントを編集"
                    >
                      編集
                    </button>
                  )}
                  {onEdit && onDelete && (
                    <span className="mx-1 text-gray-400">·</span>
                  )}
                  {onDelete && (
                    // ▼▼▼ 【変更】削除ボタンの onClick に handleDelete を割り当て ▼▼▼
                    <button
                      onClick={handleDelete}
                      className="p-1 text-xs text-red-500 hover:text-red-700 hover:underline"
                      aria-label="コメントを削除"
                    >
                      削除
                    </button>
                    // ▲▲▲ 【変更】ここまで ▲▲▲
                  )}
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
            {content}
          </p>
        </div>

        {/* 返信ボタン */}
        <div className="mt-1">
          <button
            onClick={() => onReply(commentId)}
            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
          >
            返信する
          </button>
        </div>

        {/* 返信コメントの再帰表示 */}
        {replies && replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

