import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {formatCurrency} from '@/utils/formatCurrency';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

interface ProjectSalurAmountCardsProps {
  targetAmount: number;
  collectedAmount: number;
}

// 2 kartu big number sejajar — "Kebutuhan Dana" & "Terkumpul". Kartu
// "Terkumpul" beraksen primary supaya beda dari "Kebutuhan Dana" yang netral,
// lihat detail-project-salur.md § "UI Layout".
export function ProjectSalurAmountCards({
  targetAmount,
  collectedAmount,
}: ProjectSalurAmountCardsProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={[styles.card, styles.targetCard]}>
        <Text style={styles.label}>Kebutuhan Dana</Text>
        <Text style={styles.value}>{formatCurrency(targetAmount)}</Text>
      </View>
      <View style={[styles.card, styles.collectedCard]}>
        <Text style={[styles.label, styles.collectedLabel]}>Terkumpul</Text>
        <Text style={[styles.value, styles.collectedValue]}>
          {formatCurrency(collectedAmount)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  targetCard: {
    backgroundColor: colors.neutral[50],
  },
  collectedCard: {
    backgroundColor: colors.primary[50],
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  collectedLabel: {
    color: colors.primary[600],
  },
  value: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  collectedValue: {
    color: colors.primary[700],
  },
});
