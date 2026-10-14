import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, fontFamily, spacing, radius, fontSize, fontWeight} from '@/theme';

interface QuranLastReadItemProps {
  /** Nomor di badge bundar — nomor surah atau nomor juz. */
  number: number;
  title: string;
  subtitle: string;
  /** Nama arab surah. Tidak diisi untuk item juz. */
  arabicName?: string;
  onPress: () => void;
  accessibilityLabel: string;
}

// Baris daftar bergaya design/home.png: badge angka, nama + keterangan di
// bawahnya, nama arab di kanan, dipisah garis tipis. Tanpa progress bar —
// keterangan progres cukup dibawa teks sub-judul.
export function QuranLastReadItem({
  number,
  title,
  subtitle,
  arabicName,
  onPress,
  accessibilityLabel,
}: QuranLastReadItemProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{number}</Text>
      </View>

      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {arabicName ? (
        <Text style={styles.arabic} numberOfLines={1}>
          {arabicName}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
  },
  badge: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[50],
  },
  badgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  texts: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.neutral[500],
  },
  arabic: {
    fontFamily: fontFamily.arabic,
    fontSize: fontSize.xl,
    color: colors.primary[700],
    writingDirection: 'rtl',
  },
});
