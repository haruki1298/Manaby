// src/components/notifications/NotificationItem.tsx
import type { NotificationType } from '@/types/notification'; // パスを確認
import { useNavigate } from 'react-router-dom';
import { MessageSquare, FileText } from 'lucide-react';

interface NotificationItemProps {
  notification: NotificationType;
  onRead: (notificationId: string) => void;
  onClose: () => void; // ドロップダウンを閉じるための関数
}

export function NotificationItem({ notification, onRead, onClose }: NotificationItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    // 通知を既読にする
    if (!notification.is_read) {
      onRead(notification.id);
    }
    // リンク先に遷移
    if (notification.link_to) {
      navigate(notification.link_to);
    }
    // ドロップダウンを閉じる
    onClose();
  };

  // 通知の種類に応じてアイコンを変更
  const getIcon = () => {
    switch (notification.type) {
      case 'NEW_COMMENT':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'NEW_REPLY':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 flex items-start space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
        !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      <div className="flex-shrink-0 mt-1">{getIcon()}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {new Date(notification.created_at).toLocaleString('ja-JP')}
        </p>
      </div>
      {/* 未読マーク */}
      {!notification.is_read && (
        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full self-center"></div>
      )}
    </div>
  );
}