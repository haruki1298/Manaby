// src/components/notifications/NotificationDropdown.tsx
import React from 'react';
import { useNotifications } from '@/hooks/useNotifications'; // 作成済みのフック
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
  onClose: () => void; // ドロップダウンを閉じるための関数
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  // useNotificationsフックから通知データと関数を取得
  const { notifications, isLoading, markAllAsRead, unreadCount } = useNotifications();

  return (
    <div className="absolute top-full right-0 mt-2 w-80 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      <div className="p-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-white">通知</h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            すべて既読にする
          </button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <p className="p-4 text-center text-gray-500">読み込み中...</p>
        ) : notifications.length > 0 ? (
          <div>
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={() => markAllAsRead()} // ここを修正: markAsRead(notification.id)
                onClose={onClose}
              />
            ))}
          </div>
        ) : (
          <p className="p-4 text-center text-gray-500">新しい通知はありません。</p>
        )}
      </div>
    </div>
  );
}