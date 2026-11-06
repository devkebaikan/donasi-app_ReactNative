import {useEffect} from 'react';
import {getUnreadNotificationCount} from '@/services/notificationService';
import {useNotificationStore} from '@/stores/notificationStore';
import {useAuthStore} from '@/stores/authStore';

export function useUnreadNotificationCount(): number {
  const unreadCount = useNotificationStore(s => s.unreadCount);
  const setUnreadCount = useNotificationStore(s => s.setUnreadCount);
  const accessToken = useAuthStore(s => s.accessToken);

  useEffect(() => {
    if (!accessToken) {
      setUnreadCount(0);
      return;
    }

    async function fetchUnreadCount(): Promise<void> {
      try {
        const response = await getUnreadNotificationCount();
        if (response.success || (response.status && response.status >= 200 && response.status < 300)) {
          setUnreadCount(response.data);
        }
      } catch {
        // Silently ignore — badge count is non-critical background data.
      }
    }
    fetchUnreadCount();
  }, [accessToken, setUnreadCount]);

  return unreadCount;
}

