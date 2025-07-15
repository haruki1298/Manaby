// src/components/comments/CommentList.tsx
//import React from 'react';
import { CommentItem } from './CommentItem';
import type { CommentType } from '@/types/comment'; 

interface CommentListProps {
  comments: CommentType[];
  onReply: (commentId: string) => void;
  onEdit?: (commentToEdit: CommentType) => void;
  onDelete?: (commentIdToDelete: string) => void;
}

export function CommentList({ comments, onReply, onEdit, onDelete }: CommentListProps) {
  const topLevelComments = comments.filter(comment => !comment.parent_comment_id);

  return (
    <div className="space-y-6">
      {topLevelComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}