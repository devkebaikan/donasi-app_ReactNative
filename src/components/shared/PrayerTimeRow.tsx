import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  Moon,
  MoonStars,
  Sun,
  Sun2,
  Sunrise,
  Sunset,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import type {SolarIconComponent} from '@/components/ui/Icon';
import {PrayerReminderToggle} from '@/components/shared/PrayerReminderToggle';
import {colors, fontWeight, fontSize, radius, spacing} from '@/theme';
import type {PrayerName, PrayerTimeItem} from '@/types/prayerTime';

const PRAYER_ICONS: Record<PrayerName, SolarIconComponent> = {
  IMSAK: MoonStars,
  SUBUH: MoonStars,
  TERBIT: Sunrise,
  DZUHUR: Sun,
  ASHAR: Sun2,
  MAGHRIB: Sunset,
  ISYA: Moon,
};

interface PrayerTimeRowProps {
  item: PrayerTimeItem;
  isCurrent: boolean;
  isTinted: boolean;
  isReminderActive: boolean;
  onToggleReminder: () => void;
}

export function PrayerTimeRow({
  item,
  isCurrent,
  isTinted,
  isReminderActive,
  onToggleReminder,
}: PrayerTimeRowProps): React.JSX.Element {
  return (
    <View
      style={[
        styles.row,
        isTinted && styles.rowTinted,
        isCurrent && styles.rowCurrent,
      ]}
      accessible={false}>
      <View style={styles.iconCircle}>
        <Icon
          icon={PRAYER_ICONS[item.key]}
          size={18}
          color={colors.primary[700]}
        />
      </View>

      <Text style={styles.label}>{item.label}</Text>
      <Text style={styles.time}>{item.time}</Text>

      <PrayerReminderToggle
        label={item.label}
        isActive={isReminderActive}
        onToggle={onToggleReminder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rowTinted: {
    backgroundColor: colors.primary[50],
  },
  // Waktu yang sedang berjalan ditandai border, bukan warna latar, supaya
  // tandanya tetap terbaca di baris berlatar maupun yang polos.
  rowCurrent: {
    borderColor: colors.primary[600],
    backgroundColor: colors.neutral[0],
  },
  iconCircle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
  },
  label: {
    flex: 1,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
  time: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    color: colors.neutral[700],
  },
});
