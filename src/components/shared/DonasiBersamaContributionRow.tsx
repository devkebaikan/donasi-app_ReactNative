import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Avatar} from '@/components/ui/Avatar';
import {formatRelativeTime} from '@/utils/formatRelativeTime';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {DonasiBersamaContribution} from '@/types/donasiBersama';

interface DonasiBersamaContributionRowProps {
  contribution: DonasiBersamaContribution;
  /** Sudah jadi string siap render — screen yang memutuskan disamarkan atau tidak. */
  amountLabel: string;
}

// Baris ini tidak bisa ditekan: tidak ada halaman detail kontribusi. Karena itu
// bukan TouchableOpacity, dan accessibilityRole-nya "text" — supaya screen
// reader tidak menawarkan aksi yang tidak ada.
export function DonasiBersamaContributionRow({
  contribution,
  amountLabel,
}: DonasiBersamaContributionRowProps): React.JSX.Element {
  const timeLabel = formatRelativeTime(contribution.createdAt);

  return (
    <View
      style={styles.row}
      accessibilityRole="text"
      accessibilityLabel={`${contribution.donaturName} urun ${amountLabel}, ${timeLabel}`}>
      <Avatar
        uri={contribution.avatarUrl}
        name={contribution.donaturName}
        size={44}
      />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {contribution.donaturName}
        </Text>
        <Text style={styles.time}>{timeLabel}</Text>
      </View>
      <Text style={styles.amount}>{amountLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  amount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
});
