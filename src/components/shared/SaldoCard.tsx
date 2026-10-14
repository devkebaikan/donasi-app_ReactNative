import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon} from '@/components/ui/Icon';
import {Wallet, ClockCircle} from '@solar-icons/react-native/Linear';
import {Button} from '@/components/ui/Button';
import {colors, spacing, radius, fontSize, fontWeight, shadows} from '@/theme';
import {formatCurrency} from '@/utils/formatCurrency';
import type {PrayerTime} from '@/types/prayerTime';

interface SaldoCardProps {
  balance: number;
  nextPrayerTime: PrayerTime | null;
  hijriDate: string;
  isAuthenticated: boolean;
  onPressAction: () => void;
}

export function SaldoCard({
  balance,
  nextPrayerTime,
  hijriDate,
  isAuthenticated,
  onPressAction,
}: SaldoCardProps): React.JSX.Element {
  const displayBalance = isAuthenticated ? formatCurrency(balance) : '●●●●●●●●';
  const buttonLabel = isAuthenticated ? 'Top Up' : 'Masuk';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrapper}>
            <Icon icon={Wallet} size={24} color={colors.primary[500]} />
          </View>
          <View style={styles.titleBalance}>
            <Text style={styles.title}>Saldo Kebaikan</Text>
            <Text style={[styles.balance, !isAuthenticated && styles.balanceHidden]}>
              {displayBalance}
            </Text>
          </View>
        </View>
        <Button label={buttonLabel} onPress={onPressAction} size="smWide" />
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.prayerInfo}>
          <Icon icon={ClockCircle} size={14} color={colors.neutral[900]} />
          <Text style={styles.infoText}>
            {nextPrayerTime
              ? `${nextPrayerTime.name} ${nextPrayerTime.time}`
              : '-'}
          </Text>
        </View>
        <Text style={styles.infoText}>{hijriDate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    // marginHorizontal: spacing.lg,
    // marginVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    // borderRadius: radius.xl,
    backgroundColor: colors.neutral[0],
    gap: spacing.md,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBalance: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
  balance: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  balanceHidden: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: colors.neutral[400],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral[200],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
});
