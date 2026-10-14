import {useEffect} from 'react';
import {getUnreadNotificationCount} from '@/services/notificationService';
import {useNotificationStore} from '@/stores/notificationStore';

export function useUnreadNotificationCount(): number {
  const unreadCount = useNotificationStore(s => s.unreadCount);
  const setUnreadCount = useNotificationStore(s => s.setUnreadCount);

  useEffect(() => {
    async function fetchUnreadCount(): Promise<void> {
      try {
        const response = await getUnreadNotificationCount();
        if (response.success) {
          setUnreadCount(response.data);
        }
      } catch {
        // Silently ignore — badge count is non-critical background data.
      }
    }
    fetchUnreadCount();
  }, [setUnreadCount]);

  return unreadCount;
}
