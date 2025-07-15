// src/types/notification.ts
import type { Database } from '../../database.types'; // database.types.tsへのパスを確認

/**
 * notificationsテーブルの行の型をインポート
 */
export type NotificationRow = Database['public']['Tables']['notifications']['Row'];

/**
 * フロントエンドで使いやすいように拡張した通知の型
 * 必要に応じて、source_user の情報などを追加できます
 */
export interface NotificationType extends NotificationRow {
  // 現時点では、データベースの行の型と同一で十分です。
  // 将来的に、source_user_id から取得したユーザー名などを追加したくなるかもしれません。
  // source_user_profile?: { full_name?: string | null; avatar_url?: string | null; };
}