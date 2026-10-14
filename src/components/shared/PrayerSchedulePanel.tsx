import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Compass, Settings} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import type {SolarIconComponent} from '@/components/ui/Icon';
import {PrayerTimeRow} from '@/components/shared/PrayerTimeRow';
import {colors, fontWeight, fontSize, radius, spacing} from '@/theme';
import type {PrayerName, PrayerTimeItem} from '@/types/prayerTime';

interface PanelActionProps {
  icon: SolarIconComponent;
  label: string;
  onPress: () => void;
}

function PanelAction({
  icon,
  label,
  onPress,
}: PanelActionProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.action}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <View style={styles.actionCircle}>
        <Icon icon={icon} size={22} color={colors.primary[600]} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

interface PrayerSchedulePanelProps {
  dateLabel: string;
  hijriLabel: string;
  times: PrayerTimeItem[];
  currentPrayerKey: PrayerName | null;
  reminders: Record<PrayerName, boolean>;
  onToggleReminder: (prayer: PrayerName) => void;
  onPressKiblat: () => void;
  onPressSetting: () => void;
}

export function PrayerSchedulePanel({
  dateLabel,
  hijriLabel,
  times,
  currentPrayerKey,
  reminders,
  onToggleReminder,
  onPressKiblat,
  onPressSetting,
}: PrayerSchedulePanelProps): React.JSX.Element {
  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View style={styles.dateGroup}>
          <Text style={styles.date}>{dateLabel}</Text>
          <Text style={styles.hijri}>{hijriLabel}</Text>
        </View>

        <View style={styles.actions}>
          <PanelAction icon={Compass} label="Kiblat" onPress={onPressKiblat} />
          <PanelAction
            icon={Settings}
            label="Pengaturan"
            onPress={onPressSetting}
          />
        </View>
      </View>

      <View style={styles.list}>
        {times.map((item, index) => (
          <PrayerTimeRow
            key={item.key}
            item={item}
            isCurrent={item.key === currentPrayerKey}
            isTinted={index % 2 === 0}
            isReminderActive={reminders[item.key]}
            onToggleReminder={() => onToggleReminder(item.key)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  dateGroup: {
    flexShrink: 1,
    gap: 2,
  },
  date: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
    color: colors.neutral[900],
  },
  hijri: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 44,
  },
  actionCircle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
  },
  actionLabel: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.xs,
    color: colors.neutral[600],
  },
  list: {
    gap: spacing.xs,
  },
});
