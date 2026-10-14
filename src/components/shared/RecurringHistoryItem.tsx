import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {CheckCircle, CloseCircle} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {formatCurrency} from '@/utils/formatCurrency';
import {formatShortDateTime} from '@/utils/formatDate';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {RecurringDonationHistoryEntry} from '@/types/recurringDonation';

interface RecurringHistoryItemProps {
  entry: RecurringDonationHistoryEntry;
}

export function RecurringHistoryItem({
  entry,
}: RecurringHistoryItemProps): React.JSX.Element {
  const isSuccess = entry.status === 'BERHASIL';

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`${isSuccess ? 'Berhasil' : 'Gagal'}, ${formatCurrency(entry.amount)}, ${formatShortDateTime(entry.executedAt)}`}>
      <Icon
        icon={isSuccess ? CheckCircle : CloseCircle}
        size={20}
        color={isSuccess ? colors.semantic.success : colors.semantic.error}
      />
      <Text style={styles.amount}>{formatCurrency(entry.amount)}</Text>
      <Text style={styles.date}>{formatShortDateTime(entry.executedAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Satu baris riwayat = satu kartu, mengikuti DonasiBersamaContributionRow.
  // Sebelumnya semua baris menumpuk di dalam satu kartu besar sehingga tiap
  // eksekusi sulit dibaca sebagai kejadian terpisah.
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
  },
  amount: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
});
