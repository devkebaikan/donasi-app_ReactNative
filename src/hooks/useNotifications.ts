import {useCallback, useEffect, useState} from 'react';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/services/notificationService';
import {useNotificationStore} from '@/stores/notificationStore';
import {showToast} from '@/utils/toast';
import type {Notification, NotificationFilter} from '@/types/notification';

type State = {
  notifications: Notification[];
  activeFilter: NotificationFilter;
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
};

type Actions = {
  changeFilter: (filter: NotificationFilter) => void;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

export function useNotifications(isAuthenticated: boolean): State & Actions {
  const unreadCount = useNotificationStore(s => s.unreadCount);
  const setUnreadCount = useNotificationStore(s => s.setUnreadCount);
  const decrementUnreadCount = useNotificationStore(
    s => s.decrementUnreadCount,
  );

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchUnreadCount = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      return;
    }
    try {
      const response = await getUnreadNotificationCount();
      if (response.success) {
        setUnreadCount(response.data);
      }
    } catch {
      // Silently ignore — badge count is non-critical background data.
    }
  }, [isAuthenticated, setUnreadCount]);

  const loadPage = useCallback(
    async (filter: NotificationFilter, targetPage: number): Promise<void> => {
      const response = await getNotifications(filter, targetPage);
      if (!response.success) {
        showToast(response.message);
        return;
      }
      setNotifications(previous =>
        targetPage === 1 ? response.data : [...previous, ...response.data],
      );
      setHasMore(response.data.length > 0);
      setPage(targetPage);
    },
    [],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setHasMore(true);
      setPage(1);
      setIsLoading(false);
      return;
    }
    async function init(): Promise<void> {
      setIsLoading(true);
      try {
        await loadPage(activeFilter, 1);
      } catch {
        showToast('Tidak dapat terhubung.');
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [isAuthenticated, activeFilter, loadPage]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  function changeFilter(filter: NotificationFilter): void {
    setActiveFilter(filter);
  }

  async function refresh(): Promise<void> {
    setIsRefreshing(true);
    try {
      await loadPage(activeFilter, 1);
      await fetchUnreadCount();
    } catch {
      showToast('Tidak dapat terhubung.');
    } finally {
      setIsRefreshing(false);
    }
  }

  async function loadMore(): Promise<void> {
    if (isLoadingMore || !hasMore || isLoading) {
      return;
    }
    setIsLoadingMore(true);
    try {
      await loadPage(activeFilter, page + 1);
    } catch {
      showToast('Tidak dapat terhubung.');
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function markAsRead(id: string): Promise<void> {
    const target = notifications.find(item => item.id === id);
    if (!target || target.isRead) {
      return;
    }
    setNotifications(previous =>
      previous.map(item => (item.id === id ? {...item, isRead: true} : item)),
    );
    decrementUnreadCount();
    try {
      const response = await markNotificationAsRead(id);
      if (!response.success) {
        showToast(response.message);
      }
    } catch {
      showToast('Tidak dapat terhubung.');
    }
  }

  async function markAllAsRead(): Promise<void> {
    try {
      const response = await markAllNotificationsAsRead();
      if (!response.success) {
        showToast(response.message);
        return;
      }
      setNotifications(previous =>
        previous.map(item => ({...item, isRead: true})),
      );
      setUnreadCount(0);
    } catch {
      showToast('Tidak dapat terhubung.');
    }
  }

  return {
    notifications,
    activeFilter,
    unreadCount,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    changeFilter,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
  };
}
