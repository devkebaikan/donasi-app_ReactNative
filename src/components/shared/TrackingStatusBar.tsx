import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Bill, ClockCircle, Delivery, Home} from '@solar-icons/react-native/Linear';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {TrackingSummary} from '@/types/myDonations';

interface TrackingStatusBarProps {
  summary: TrackingSummary;
}

const ITEMS: {key: keyof TrackingSummary; label: string; icon: SolarIconComponent}[] = [
  {key: 'waitingPayment', label: 'Menunggu\nPembayaran', icon: Bill},
  {key: 'waitingDistribution', label: 'Menunggu\nSalur', icon: ClockCircle},
  {key: 'inProgress', label: 'Proses\nSalur', icon: Delivery},
  {key: 'completed', label: 'Selesai\nSalur', icon: Home},
];

export function TrackingStatusBar({
  summary,
}: TrackingStatusBarProps): React.JSX.Element {
  return (
    <View
      style={styles.container}
      accessibilityRole="summary"
      accessibilityLabel={ITEMS.map(item => `${item.label.replace('\n', ' ')} ${summary[item.key]}`).join(', ')}>
      {ITEMS.map(item => {
        const count = summary[item.key];
        return (
          <View key={item.key} style={styles.cell}>
            <View style={styles.iconWrapper}>
              <Icon icon={item.icon} size={24} color={colors.primary[600]} />
              {count > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText} numberOfLines={1}>
                    {count}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: radius.full,
    paddingHorizontal: 4,
    backgroundColor: colors.secondary[500],
    borderWidth: 2,
    borderColor: colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.neutral[0],
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.neutral[600],
    textAlign: 'center',
  },
});
