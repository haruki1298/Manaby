import { useSettings } from '@/modules/settings/settings.state.tsx';
import { useTranslation } from 'react-i18next';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
}

export function useNotifications() {
  const { settings } = useSettings();
  const { t } = useTranslation();

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn(t('notifications.browserNotSupported'));
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const showDesktopNotification = async (options: NotificationOptions): Promise<void> => {
    if (!settings.desktopNotifications) {
      console.log(t('notifications.desktopDisabled'));
      return;
    }

    const hasPermission = await requestPermission();
    if (!hasPermission) {
      console.warn(t('notifications.permissionDenied'));
      return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/vite.svg',
        badge: '/vite.svg',
      });

      // 通知をクリックした時の処理
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // 5秒後に自動で閉じる
      setTimeout(() => {
        notification.close();
      }, 5000);
    } catch (error) {
      console.error(t('notifications.showError'), error);
    }
  };

  const showEmailNotification = (options: NotificationOptions): void => {
    if (!settings.emailNotifications) {
      console.log(t('notifications.emailDisabled'));
      return;
    }

    // 実際のメール送信はサーバーサイドで実装する必要があります
    console.log(t('notifications.emailWouldBeSent'), options);
    // ここで実際のAPI呼び出しを行う
  };

  const showNotification = async (options: NotificationOptions): Promise<void> => {
    await showDesktopNotification(options);
    showEmailNotification(options);
  };

  return {
    showDesktopNotification,
    showEmailNotification,
    showNotification,
    requestPermission,
  };
}
