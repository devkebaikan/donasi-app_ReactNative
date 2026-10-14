import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Flag} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {formatCurrency} from '@/utils/formatCurrency';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

interface DonasiBersamaTargetCardProps {
  groupName: string;
  targetAmount: number;
}

export function DonasiBersamaTargetCard({
  groupName,
  targetAmount,
}: DonasiBersamaTargetCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>TUJUAN URUNAN</Text>
      <Text style={styles.name} numberOfLines={2}>
        {groupName}
      </Text>

      <View style={styles.targetBox}>
        <View style={styles.targetText}>
          <Text style={styles.targetLabel}>Target Dana</Text>
          <Text style={styles.targetAmount}>{formatCurrency(targetAmount)}</Text>
        </View>
        <View style={styles.iconCircle}>
          <Icon icon={Flag} size={18} color={colors.primary[600]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[500],
    letterSpacing: 0.5,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  targetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[0],
  },
  targetText: {
    flex: 1,
    gap: spacing.xs,
  },
  targetLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  targetAmount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
