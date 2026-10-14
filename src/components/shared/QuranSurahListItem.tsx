import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {toArabicNumber} from '@/utils/arabicNumber';
import {colors, fontFamily, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {SurahMeta} from '@/types/quran';

const REVELATION_LABEL: Record<string, string> = {
  MAKKIYAH: 'Makkiyah',
  MADANIYAH: 'Madaniyah',
};

interface QuranSurahListItemProps {
  surah: SurahMeta;
  onPress: (surah: SurahMeta) => void;
}

export function QuranSurahListItem({
  surah,
  onPress,
}: QuranSurahListItemProps): React.JSX.Element {
  const revelation = REVELATION_LABEL[surah.revelation] ?? surah.revelation;

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress(surah)}
      accessibilityRole="button"
      accessibilityLabel={`Surah ${surah.nameLatin}, ${surah.totalAyah} ayat, ${revelation}`}>
      <View style={styles.numberBadge}>
        <Text style={styles.number}>{toArabicNumber(surah.number)}</Text>
      </View>

      <View style={styles.texts}>
        <Text style={styles.name} numberOfLines={1}>
          {surah.nameLatin}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {surah.totalAyah} ayat · {revelation}
        </Text>
      </View>

      <Text style={styles.arabic} numberOfLines={1}>
        {surah.nameArabic}
      </Text>
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
    // Garis pemisah antar surah. Hairline supaya menandai batas tanpa
    // membuat daftar 114 baris terlihat penuh garis.
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
  },
  numberBadge: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
  },
  number: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[700],
  },
  texts: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  meta: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.neutral[500],
  },
  arabic: {
    fontFamily: fontFamily.arabic,
    fontSize: fontSize.lg,
    color: colors.primary[700],
    writingDirection: 'rtl',
  },
});
