import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {Notification, NotificationFilter} from '@/types/notification';
import localNotifications from '@/assets/json/notifications.json';

const readStatusMap = new Map<string, boolean>();

export async function getNotifications(
  filter: NotificationFilter,
  page: number,
): Promise<ApiResponse<Notification[]>> {
  try {
    const res = await apiClient.get<ApiResponse<Notification[]>>(
      `/notifications?type=${filter}&page=${page}`,
    );
    if (Array.isArray(res.data?.data)) {
      return res.data;
    }
  } catch (_e) {
    // Fallback defensif
  }

  const all = (localNotifications as unknown as Notification[]) || [];
  let filtered = all.map(n => ({
    ...n,
    isRead: readStatusMap.has(n.id) ? readStatusMap.get(n.id)! : n.isRead,
  }));

  if (filter === 'news') {
    filtered = filtered.filter(n => n.type === 'ORGANIZATION_NEWS');
  } else if (filter === 'donation') {
    filtered = filtered.filter(n => n.type === 'DONATION_INFO');
  }

  const pageSize = 10;
  const start = Math.max(0, (page - 1) * pageSize);
  const paged = filtered.slice(start, start + pageSize);

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: paged,
  };
}

export async function getUnreadNotificationCount(): Promise<
  ApiResponse<number>
> {
  try {
    const res = await apiClient.get<ApiResponse<number>>(
      '/notifications/unread-count',
    );
    if (typeof res.data?.data === 'number') {
      return res.data;
    }
  } catch (_e) {
    // Fallback defensif
  }

  const all = (localNotifications as unknown as Notification[]) || [];
  const unread = all.filter(n => !(readStatusMap.get(n.id) ?? n.isRead)).length;

  return {
    status: 200,
    success: true,
    message: 'OK',
    data: unread,
  };
}

export async function markNotificationAsRead(
  id: string,
): Promise<ApiResponse<null>> {
  readStatusMap.set(id, true);
  try {
    const res = await apiClient.post<ApiResponse<null>>(
      `/notifications/${id}/read`,
    );
    return res.data;
  } catch (_e) {
    return {
      status: 200,
      success: true,
      message: 'OK',
      data: null,
    };
  }
}

export async function markAllNotificationsAsRead(): Promise<
  ApiResponse<null>
> {
  const all = (localNotifications as unknown as Notification[]) || [];
  all.forEach(n => readStatusMap.set(n.id, true));
  try {
    const res = await apiClient.post<ApiResponse<null>>(
      '/notifications/read-all',
    );
    return res.data;
  } catch (_e) {
    return {
      status: 200,
      success: true,
      message: 'OK',
      data: null,
    };
  }
}
