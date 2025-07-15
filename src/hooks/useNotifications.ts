// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import type { NotificationType } from '@/types/notification'; // 作成した型定義
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useNotifications() {
  const { currentUser } = useCurrentUserStore();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 通知を取得する関数
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(30); // 最新30件を取得

      if (error) { throw error; }

      if (data) {
        setNotifications(data as NotificationType[]);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // 初期読み込み
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // リアルタイム更新の購読
  useEffect(() => {
    if (!currentUser) return;

    const channel: RealtimeChannel = supabase
      .channel(`notifications:${currentUser.id}`)
      .on<NotificationType>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUser.id}` },
        (payload) => {
          console.log('New notification received!', payload.new);
          setNotifications(prev => [payload.new as NotificationType, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    // コンポーネントがアンマウントされるときに購読を解除
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // 1件を既読にする関数
  const markAsRead = async (notificationId: string) => {
    const target = notifications.find(n => n.id === notificationId);
    if (!target || target.is_read) return;

    // UIを即時更新 (楽観的UI更新)
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    // DBを更新
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) { // もしDB更新が失敗したらUIを元に戻す
      console.error('Error marking notification as read:', error);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: false } : n));
      setUnreadCount(prev => prev + 1);
    }
  };
  
  // 全てを既読にする関数
  const markAllAsRead = async () => {
    if (!currentUser || unreadCount === 0) return;

    // UIを即時更新
    const originalNotifications = [...notifications];
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    // DBを更新
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUser.id)
      .eq('is_read', false);
    
    if (error) { // もしDB更新が失敗したらUIを元に戻す
      console.error('Error marking all as read:', error);
      setNotifications(originalNotifications);
      setUnreadCount(originalNotifications.filter(n => !n.is_read).length);
    }
  };

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead };
}