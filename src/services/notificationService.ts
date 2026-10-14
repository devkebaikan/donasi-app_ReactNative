import {apiClient} from './apiClient';
import type {ApiResponse} from '@/types/api';
import type {Notification, NotificationFilter} from '@/types/notification';

export async function getNotifications(
  filter: NotificationFilter,
  page: number,
): Promise<ApiResponse<Notification[]>> {
  const res = await apiClient.get<ApiResponse<Notification[]>>(
    `/notifications?type=${filter}&page=${page}`,
  );
  return res.data;
}

export async function getUnreadNotificationCount(): Promise<
  ApiResponse<number>
> {
  const res = await apiClient.get<ApiResponse<number>>(
    '/notifications/unread-count',
  );
  return res.data;
}

export async function markNotificationAsRead(
  id: string,
): Promise<ApiResponse<null>> {
  const res = await apiClient.post<ApiResponse<null>>(
    `/notifications/${id}/read`,
  );
  return res.data;
}

export async function markAllNotificationsAsRead(): Promise<
  ApiResponse<null>
> {
  const res = await apiClient.post<ApiResponse<null>>(
    '/notifications/read-all',
  );
  return res.data;
}
