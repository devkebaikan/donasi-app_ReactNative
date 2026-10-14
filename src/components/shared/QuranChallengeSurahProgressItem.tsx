import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Icon} from '@/components/ui/Icon';
import {CheckCircle, Book} from '@solar-icons/react-native/Bold';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {ChallengeSurahProgress} from '@/types/quran';

interface QuranChallengeSurahProgressItemProps {
  surah: ChallengeSurahProgress;
  onPress: (surah: ChallengeSurahProgress) => void;
}

export function QuranChallengeSurahProgressItem({
  surah,
  onPress,
}: QuranChallengeSurahProgressItemProps): React.JSX.Element {
  const isInProgress = !surah.isCompleted && surah.readAyah > 0;

  const statusLabel = surah.isCompleted
    ? 'selesai'
    : isInProgress
      ? `ayat ${surah.readAyah}/${surah.totalAyah}`
      : 'belum dibaca';

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress(surah)}
      accessibilityRole="button"
      accessibilityLabel={`${surah.nameLatin}, ${statusLabel}`}>
      {/* Tiga status dibedakan bentuk, bukan hanya warna, supaya tetap
          terbaca bagi pengguna yang sulit membedakan warna. */}
      {surah.isCompleted ? (
        <Icon icon={CheckCircle} size={24} color={colors.semantic.success} />
      ) : isInProgress ? (
        <Icon icon={Book} size={24} color={colors.primary[500]} />
      ) : (
        <View style={styles.emptyCircle} />
      )}

      <Text style={styles.number}>{surah.surahNumber}</Text>

      <Text style={styles.name} numberOfLines={1}>
        {surah.nameLatin}
      </Text>

      <Text
        style={[
          styles.status,
          surah.isCompleted && styles.statusCompleted,
          isInProgress && styles.statusInProgress,
        ]}>
        {statusLabel}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  emptyCircle: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.neutral[300],
  },
  number: {
    minWidth: 28,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[500],
  },
  name: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  status: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.neutral[500],
  },
  statusCompleted: {
    color: colors.semantic.success,
    fontWeight: fontWeight.semiBold,
  },
  statusInProgress: {
    color: colors.primary[600],
  },
});
