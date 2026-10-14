import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {formatCurrency} from '@/utils/formatCurrency';
import {formatDate} from '@/utils/formatDate';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

// Foto program selalu landscape 16:9 — mengikuti kartu program di daftar donasi
// (ProgramCard/DonationListCard). Thumbnail persegi memotong sisi kiri-kanan
// foto sehingga programnya jadi sulit dikenali.
const THUMBNAIL_WIDTH = 100;
const THUMBNAIL_HEIGHT = (THUMBNAIL_WIDTH * 9) / 16;

interface DonationHistoryItemProps {
  imageUrl: string;
  title: string;
  date: string;
  amount: number;
  statusLabel: string;
  statusColor: {bg: string; text: string};
  onPress: () => void;
}

export function DonationHistoryItem({
  imageUrl,
  title,
  date,
  amount,
  statusLabel,
  statusColor,
  onPress,
}: DonationHistoryItemProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${statusLabel}, ${formatCurrency(amount)}`}>
      <Image
        source={{uri: imageUrl}}
        style={styles.thumbnail}
        resizeMode="cover"
        accessibilityRole="image"
        accessibilityLabel={title}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.date}>{formatDate(date)}</Text>
          <View style={[styles.badge, {backgroundColor: statusColor.bg}]}>
            <Text style={[styles.badgeText, {color: statusColor.text}]}>
              {statusLabel}
            </Text>
          </View>
        </View>
        <Text style={styles.amount}>{formatCurrency(amount)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
    padding: spacing.sm,
    gap: spacing.md,
  },
  thumbnail: {
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[200],
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  amount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
});
