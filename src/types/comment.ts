// src/types/comment.ts

/**
 * コメント投稿者のプロフィール情報を表す型。
 * 将来的にはSupabaseのprofilesテーブルの構造と一致させることを目指します。
 * ダミーデータ版では、表示に必要な最小限の情報を持ちます。
 */
export interface UserProfile {
  id: string;                 // ユーザーの一意なID (例: 'user-alice', 'user-bob')
  full_name?: string | null;   // 表示名 (例: 'Alice', 'Bob Dummy')
                              // オプショナルにしておくことで、匿名の場合も表現しやすくします。
  avatar_url?: string | null;  // アバター画像のURL (例: 'https://via.placeholder.com/40/...')
                              // これもオプショナルです。
  // ダミーデータや初期段階では、よりシンプルな display_name だけでもOKです。
  // display_name?: string;
}

/**
 * 個々のコメントデータを表す型。
 * 返信コメントも同じ型を使い、repliesプロパティでネスト構造を表現します。
 */
export interface CommentType {
  id: string;                 // コメントの一意なID (例: 'dummy-c1', 'dummy-c2')
  note_id: number;            // このコメントがどのノートに紐づくか (ダミーデータ用)
                              // PublicNote.tsx で表示中のノートのIDと照合します。
  user_id: string | null;     // コメント投稿者のユーザーID。匿名の場合はnull。
  parent_comment_id: string | null; // 返信先の親コメントのID。トップレベルのコメントならnull。
  content: string;              // コメントの本文。
  created_at: string;           // コメントの作成日時 (ISO 8601形式の文字列を想定: new Date().toISOString())
  user: UserProfile | null;   // コメント投稿者の情報。匿名の場合はnull。
  replies?: CommentType[];     // このコメントへの返信コメントの配列。返信がなければundefinedまたは空配列。
}