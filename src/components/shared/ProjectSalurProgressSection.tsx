import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Calendar} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {ProgramProgressBar} from '@/components/shared/ProgramProgressBar';
import {formatDate} from '@/utils/formatDate';
import {colors, spacing, fontSize} from '@/theme';

interface ProjectSalurProgressSectionProps {
  progressPercent: number; // sudah di-clamp maksimal 100 di layer mapping
  beneficiaryCount: number;
  distributedAt: string;
}

export function ProjectSalurProgressSection({
  progressPercent,
  beneficiaryCount,
  distributedAt,
}: ProjectSalurProgressSectionProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <ProgramProgressBar progress={progressPercent} />
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>{progressPercent}% terkumpul</Text>
        <Text style={styles.statsText}>
          {beneficiaryCount.toLocaleString('id-ID')} penerima manfaat
        </Text>
      </View>
      <View style={styles.dateRow}>
        <Icon icon={Calendar} size={16} color={colors.neutral[500]} />
        <Text style={styles.dateText}>
          Pelaksanaan: {formatDate(distributedAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsText: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
});
