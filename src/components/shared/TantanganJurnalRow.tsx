import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {AltArrowRight} from '@solar-icons/react-native/Linear';
import {CheckCircle, Fire, Star} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {TantanganJurnalItem} from '@/types/tantangan';

const HIT_SLOP = {top: 10, bottom: 10, left: 10, right: 10};

interface TantanganJurnalRowProps {
  item: TantanganJurnalItem;
  /** Dikunci saat jurnal dibuka pada tanggal selain hari ini. */
  isLocked?: boolean;
  onPress: (item: TantanganJurnalItem) => void;
  onPressTitle: (item: TantanganJurnalItem) => void;
}

function getSubtitle(item: TantanganJurnalItem): string {
  if (item.isRecommendedToday) {
    return 'Disarankan Hari Ini';
  }
  return item.dailyTargetText
    ? `Target: ${item.dailyTargetText}`
    : 'Kapan saja';
}

// Struktur baris dan pola optimistic toggle-nya meniru AmalanRow. Bedanya,
// judul yang sudah dicatat DICORET di sini — jurnal ini daftar yang harus
// dijalani hari itu, bukan catatan amalan yang sudah lewat.
export function TantanganJurnalRow({
  item,
  isLocked = false,
  onPress,
  onPressTitle,
}: TantanganJurnalRowProps): React.JSX.Element {
  // Baris tantangan bacaan tidak pernah dicentang di sini — progresnya milik
  // domain Quran. Lingkaran centangnya diganti chevron supaya bentuknya sendiri
  // sudah memberi tahu bahwa menekannya berpindah, bukan mencatat.
  const isQuran = item.action.type === 'quran';
  const hasStreak = item.streakDays > 0;
  const subtitle = getSubtitle(item);

  return (
    <View
      style={[
        styles.row,
        item.isRecommendedToday && styles.rowRecommended,
        item.isDoneToday && styles.rowDone,
      ]}>
      <TouchableOpacity
        style={styles.markButton}
        disabled={isLocked}
        onPress={() => onPress(item)}
        hitSlop={HIT_SLOP}
        accessibilityRole={isQuran ? 'button' : 'checkbox'}
        accessibilityState={{checked: item.isDoneToday, disabled: isLocked}}
        accessibilityLabel={
          isQuran
            ? `Buka menu Quran untuk ${item.name}`
            : `${item.name}, ${item.isDoneToday ? 'sudah dicatat' : 'belum dicatat'}`
        }>
        {isQuran ? (
          <Icon icon={AltArrowRight} size={22} color={colors.primary[600]} />
        ) : (
          <View
            style={[styles.circle, item.isDoneToday && styles.circleDone]}>
            {item.isDoneToday ? (
              <Icon icon={CheckCircle} size={20} color={colors.neutral[0]} />
            ) : null}
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.body}
        onPress={() => onPressTitle(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Buka detail tantangan ${item.name}`}>
        <Text
          style={[styles.title, item.isDoneToday && styles.titleDone]}
          numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.subtitleRow}>
          {item.isRecommendedToday ? (
            <Icon icon={Star} size={12} color={colors.secondary[600]} />
          ) : null}
          <Text
            style={[
              styles.subtitle,
              item.isRecommendedToday && styles.subtitleRecommended,
            ]}
            numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        {isQuran ? (
          <Text style={styles.quranNote}>Progres dicatat di menu Quran</Text>
        ) : null}
      </TouchableOpacity>

      <View style={[styles.streak, hasStreak && styles.streakActive]}>
        <Icon
          icon={Fire}
          size={12}
          color={hasStreak ? colors.secondary[600] : colors.neutral[400]}
        />
        <Text
          style={[styles.streakLabel, hasStreak && styles.streakLabelActive]}
          accessibilityLabel={`Runtun ${item.streakDays} hari`}>
          {item.streakDays}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 64,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
  },
  rowRecommended: {
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary[500],
  },
  rowDone: {
    backgroundColor: colors.primary[50],
  },
  markButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[600],
  },
  body: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 44,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.neutral[400],
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  subtitleRecommended: {
    color: colors.secondary[600],
    fontWeight: fontWeight.medium,
  },
  quranNote: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
  },
  streakActive: {
    backgroundColor: colors.secondary[100],
  },
  streakLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[400],
  },
  streakLabelActive: {
    color: colors.secondary[600],
  },
});
