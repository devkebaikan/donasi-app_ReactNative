import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Avatar} from '@/components/ui/Avatar';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {TantanganLeaderboardEntry} from '@/types/tantangan';

interface TantanganLeaderboardRowProps {
  entry: TantanganLeaderboardEntry;
}

// Bentuknya disalin dari DonasiBersamaContributionRow: avatar kiri, nama +
// subjudul, nilai di kanan. Sama seperti di sana, baris ini tidak bisa ditekan
// — tidak ada halaman detail kontribusi — jadi bukan TouchableOpacity dan
// accessibilityRole-nya "text", supaya screen reader tidak menawarkan aksi
// yang tidak ada.
export function TantanganLeaderboardRow({
  entry,
}: TantanganLeaderboardRowProps): React.JSX.Element {
  const displayName = entry.isMe ? `${entry.name} (Anda)` : entry.name;
  const hasActivity = entry.lastActivityLabel != null;
  const subtitle = hasActivity
    ? `Terakhir dicatat: ${entry.lastActivityLabel}`
    : 'Ayo mulai hari ini!';

  return (
    <View
      style={[styles.row, entry.isMe && styles.rowMe]}
      accessibilityRole="text"
      accessibilityLabel={`${displayName}, kontribusi ${entry.contributionLabel}, ${subtitle}`}>
      <Avatar uri={entry.avatarUrl} name={entry.name} size={44} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <Text
          style={[styles.subtitle, !hasActivity && styles.subtitleCta]}
          numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.valueColumn}>
        <Text style={styles.value}>{entry.contributionLabel}</Text>
        <Text style={styles.valueLabel}>KONTRIBUSI</Text>
      </View>
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
    backgroundColor: colors.neutral[0],
  },
  rowMe: {
    backgroundColor: colors.primary[50],
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
  subtitle: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  subtitleCta: {
    color: colors.primary[600],
    fontWeight: fontWeight.medium,
  },
  valueColumn: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  valueLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
  },
});
