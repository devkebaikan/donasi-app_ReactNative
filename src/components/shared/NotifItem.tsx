import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';
import {HandMoney, FileText, Bell} from '@solar-icons/react-native/Linear';
import {colors, spacing, fontSize, fontWeight, lineHeight} from '@/theme';
import {formatDate} from '@/utils/formatDate';
import type {Notification, NotificationType} from '@/types/notification';

interface NotifItemProps {
  notification: Notification;
  onPress: () => void;
}

const TYPE_CONFIG: Record<
  NotificationType,
  {label: string; icon: SolarIconComponent}
> = {
  DONATION_INFO: {label: 'Info Donasi', icon: HandMoney},
  ORGANIZATION_NEWS: {label: 'Berita Lembaga', icon: FileText},
  SYSTEM: {label: 'Sistem', icon: Bell},
};

export function NotifItem({
  notification,
  onPress,
}: NotifItemProps): React.JSX.Element {
  const config = TYPE_CONFIG[notification.type];

  return (
    <TouchableOpacity
      style={[styles.container, !notification.isRead && styles.unread]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${config.label}, ${notification.title}${
        notification.isRead ? '' : ', belum dibaca'
      }`}>
      {!notification.isRead ? <View style={styles.dot} /> : null}
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Icon icon={config.icon} size={16} color={colors.primary[500]} />
          <Text style={styles.typeLabel}>{config.label}</Text>
          <Text style={styles.date}>{formatDate(notification.createdAt)}</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
  },
  unread: {
    backgroundColor: colors.primary[50],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[500],
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  body: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[600],
  },
});
