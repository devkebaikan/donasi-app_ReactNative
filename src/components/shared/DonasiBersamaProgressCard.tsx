import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ClockCircle} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {ProgramProgressBar} from '@/components/shared/ProgramProgressBar';
import {formatCurrency} from '@/utils/formatCurrency';
import {getDonationProgress} from '@/utils/donationProgress';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {DonasiBersamaDetail} from '@/types/donasiBersama';

interface DonasiBersamaProgressCardProps {
  group: DonasiBersamaDetail;
}

export function DonasiBersamaProgressCard({
  group,
}: DonasiBersamaProgressCardProps): React.JSX.Element {
  const progress = getDonationProgress(
    group.collectedAmount,
    group.targetAmount,
  );
  const isEnded = group.status === 'ended' || group.daysLeft <= 0;
  // Dibulatkan ke bawah supaya 99,7% tidak tampil 100% sebelum target
  // benar-benar tercapai.
  const percentageText =
    group.targetAmount <= 0
      ? 'Target Terpenuhi'
      : `${Math.floor(progress)}% Tercapai`;

  return (
    <View style={styles.card}>
      <View style={styles.amountRow}>
        <View style={styles.amountBlock}>
          <Text style={styles.label}>Urunan Terkumpul</Text>
          <Text style={styles.collected}>
            {formatCurrency(group.collectedAmount)}
          </Text>
        </View>
        <View style={styles.amountBlockRight}>
          <Text style={styles.label}>Target</Text>
          <Text style={styles.target}>{formatCurrency(group.targetAmount)}</Text>
        </View>
      </View>

      <ProgramProgressBar progress={progress} />

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Icon icon={ClockCircle} size={16} color={colors.neutral[500]} />
          <Text style={styles.footerText}>
            {isEnded ? 'Berakhir' : `Sisa ${group.daysLeft} Hari`}
          </Text>
        </View>
        <Text style={styles.footerText}>{percentageText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  amountBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  amountBlockRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  collected: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  target: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[0],
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
});
