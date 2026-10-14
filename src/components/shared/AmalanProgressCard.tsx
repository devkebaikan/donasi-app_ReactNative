import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {AmalanProgressRing} from '@/components/shared/AmalanProgressRing';
import {colors, spacing, radius, shadows, fontWeight, fontSize, lineHeight} from '@/theme';
import type {AmalanSummary} from '@/types/amalan';

interface AmalanProgressCardProps {
  summary: AmalanSummary;
}

// Dibulatkan ke bawah, bukan Math.round: 99,x% tidak boleh tampil sebagai 100%
// selagi masih ada amalan yang belum selesai. 100% harus berarti tuntas.
export function getAmalanPercentage(summary: AmalanSummary): number {
  if (summary.total <= 0) {
    return 0;
  }
  return Math.floor((summary.done / summary.total) * 100);
}

export function AmalanProgressCard({
  summary,
}: AmalanProgressCardProps): React.JSX.Element {
  const percentage = getAmalanPercentage(summary);
  const subtitle =
    summary.total > 0
      ? `Kamu sudah menyelesaikan ${summary.done} dari ${summary.total} amalan`
      : 'Belum ada amalan yang dicatat';

  return (
    <View
      style={styles.card}
      accessibilityRole="text"
      accessibilityLabel={`Progres hari ini, ${subtitle}, ${percentage} persen`}>
      <View style={styles.textColumn}>
        <Text style={styles.title}>Progres Hari Ini</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <AmalanProgressRing percentage={percentage} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  textColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
    color: colors.neutral[900],
  },
  subtitle: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.normal,
    color: colors.neutral[600],
  },
});
