// src/components/comments/CommentList.tsx
import React from 'react';
import { CommentItem } from './CommentItem';
import type { CommentType } from '@/types/comment'; // ★パス確認

interface CommentListProps {
  comments: CommentType[];
  onReply: (commentId: string) => void;
  onEdit?: (commentToEdit: CommentType) => void;   // オプショナル
  onDelete?: (commentIdToDelete: string) => void; // オプショナル
}

export function CommentList({ comments, onReply, onEdit, onDelete }: CommentListProps) {
  // トップレベルのコメントのみをフィルタリング
  // CommentType の定義に合わせてプロパティ名を修正 (parent_comment_id を想定)
  const topLevelComments = comments.filter(comment => !comment.parent_comment_id);

  return (
    <div className="space-y-6"> {/* コメント間のスペース */}
      {topLevelComments.map((comment) => (
        <CommentItem
          key={comment.id} // リスト内の各要素にはユニークなkeyが必要
          comment={comment}
          onReply={onReply}
          onEdit={onEdit}     // onEditをCommentItemに渡す
          onDelete={onDelete}   // onDeleteをCommentItemに渡す
        />
      ))}
    </div>
  );
}