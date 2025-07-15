// src/types/comment.ts

/**
 * コメント投稿者のプロフィール情報を表す型。
 * profilesテーブルがないため、IDと仮の表示名のみを定義します。
 * 将来profilesテーブルができたら、full_nameやavatar_urlを追加します。
 */
export interface UserProfile {
  id: string; // auth.users.id (uuid)
  display_name?: string; // フロントで生成する仮の表示名 (例: "ユーザー (abc123)")
}

/**
 * コメントデータを表す型 (フロントエンド用)
 * Supabaseから取得したデータをこの形に整形して使います。
 */
export interface CommentType {
  id: string;                   // comments.id
  note_id: number;              // comments.note_id
  user_id: string | null;       // comments.user_id
  parent_comment_id: string | null; // comments.parent_comment_id
  content: string;                // comments.content
  created_at: string;             // comments.created_at
  
  // 上記はデータベースの構造に近いプロパティ。
  // 以下は、UIで使いやすくするために追加するプロパティ。
  user: UserProfile | null;     // 投稿者情報 (UserProfile型)。匿名の場合はnull。
  replies?: CommentType[];       // このコメントへの返信コメントの配列。
}