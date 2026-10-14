import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {ClockCircle} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {formatDateTime} from '@/utils/formatDate';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

interface PaymentBannerProps {
  expiredAt: string;
  secondsLeft: number;
  isExpired: boolean;
}

function formatCountdown(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number): string => String(value).padStart(2, '0');
  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

export function PaymentBanner({
  expiredAt,
  secondsLeft,
  isExpired,
}: PaymentBannerProps): React.JSX.Element {
  if (isExpired) {
    return (
      <View style={styles.expiredContainer}>
        <Text style={styles.expiredLabel}>
          Batas waktu pembayaran telah habis
        </Text>
        <Text style={styles.expiredDate}>{formatDateTime(expiredAt)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[colors.primary[400], colors.primary[700]]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text style={styles.label}>Batas waktu pembayaran</Text>
        <View style={styles.row}>
          <Text style={styles.date}>{formatDateTime(expiredAt)}</Text>
          <View style={styles.countdown}>
            <Icon icon={ClockCircle} size={14} color={colors.primary[600]} />
            <Text style={styles.countdownText}>{formatCountdown(secondsLeft)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary[50],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  date: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[0],
  },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[0],
  },
  countdownText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
  },
  expiredContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.semantic.errorLight,
    gap: spacing.xs,
  },
  expiredLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.semantic.error,
  },
  expiredDate: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
});
