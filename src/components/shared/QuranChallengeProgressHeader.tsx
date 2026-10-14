import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon} from '@/components/ui/Icon';
import {Calendar} from '@solar-icons/react-native/Linear';
import {Cup} from '@solar-icons/react-native/Bold';
import {QuranProgressBar} from '@/components/shared/QuranProgressBar';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

interface QuranChallengeProgressHeaderProps {
  name: string;
  percentage: number;
  completedSurahCount: number;
  totalSurahCount: number;
  remainingDays: number;
  isEnded: boolean;
  isAllCompleted: boolean;
}

export function QuranChallengeProgressHeader({
  name,
  percentage,
  completedSurahCount,
  totalSurahCount,
  remainingDays,
  isEnded,
  isAllCompleted,
}: QuranChallengeProgressHeaderProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>CHALLENGE</Text>
      <Text style={styles.name}>{name}</Text>

      <View style={styles.progressBlock}>
        {isAllCompleted ? (
          <View style={styles.completedRow}>
            <Icon icon={Cup} size={28} color={colors.semantic.success} />
            <Text style={styles.completedLabel}>Challenge selesai</Text>
          </View>
        ) : null}

        <Text style={styles.percentage}>{percentage}%</Text>
        <QuranProgressBar percentage={percentage} />
        <Text style={styles.counter}>
          {completedSurahCount} dari {totalSurahCount} surah selesai
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Icon icon={Calendar} size={16} color={colors.neutral[500]} />
        <Text style={styles.meta}>
          {isEnded ? 'Challenge berakhir' : `Sisa ${remainingDays} hari`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
    letterSpacing: 1,
  },
  name: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  progressBlock: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.primary[50],
    gap: spacing.sm,
    alignItems: 'center',
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  completedLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.semantic.success,
  },
  percentage: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  counter: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.neutral[600],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  meta: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.neutral[600],
  },
});
