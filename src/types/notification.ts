export type NotificationType = 'DONATION_INFO' | 'ORGANIZATION_NEWS' | 'SYSTEM';

export type NotificationTargetType = 'program' | 'article' | 'donation';

export type NotificationFilter = 'all' | 'news' | 'donation';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  deepLink?: string;
  targetId?: string;
  targetType?: NotificationTargetType;
}

export interface NotificationListMeta {
  page: number;
  hasMore: boolean;
}
