// src/types/comment.ts
export interface UserProfile {
  id: string; // auth.users.id (uuid)
  full_name?: string | null; // commenter_name から取得
  avatar_url?: string | null; // commenter_avatar_url から取得
}

export interface CommentType {
  id: string;
  note_id: number;
  user_id: string | null;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  user: UserProfile | null;
  replies?: CommentType[];
  // DBのRow型には commenter_name などがあるが、
  // フロントでは user オブジェクトに集約するので、ここでは不要
}