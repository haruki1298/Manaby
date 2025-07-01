// src/types/comment.ts (新規作成または修正)

/**
 * コメント投稿者のプロフィール情報を表す型。
 * 現状はprofilesテーブルがないため、IDと仮の表示名のみ。
 */
export interface UserProfile {
  id: string; // auth.users.id (uuid)
  display_name?: string; // フロントで生成する仮の表示名 (例: "ユーザー (abc123)")
  // 将来profilesテーブルができたら、full_nameやavatar_urlを追加
}

/**
 * コメントデータを表す型 (フロントエンド用)
 */
export interface CommentType {
  id: string;                   // comments.id
  note_id: number;              // comments.note_id
  user_id: string | null;       // comments.user_id
  parent_comment_id: string | null; // comments.parent_comment_id
  content: string;                // comments.content
  created_at: string;             // comments.created_at
  user: UserProfile | null;     // 投稿者情報 (UserProfile型)
  replies?: CommentType[];       // ネストされた返信コメント
}