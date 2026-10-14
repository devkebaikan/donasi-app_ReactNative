import React from 'react';
import {View, Text, TouchableOpacity, Pressable, StyleSheet} from 'react-native';
import type {AccessibilityActionEvent} from 'react-native';
import {Icon} from '@/components/ui/Icon';
import {
  AltArrowRight,
  TrashBinMinimalistic,
  PenNewSquare,
} from '@solar-icons/react-native/Linear';
import {QuranProgressBar} from '@/components/shared/QuranProgressBar';
import {QuranStatusBadge} from '@/components/shared/QuranStatusBadge';
import {colors, fontFamily, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {
  JuzReadingHistory,
  SavedSurah,
  Schedule,
  SurahReadingHistory,
} from '@/types/quran';

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

// String date-only diparse sebagai UTC oleh JS, jadi tanggalnya dipecah
// manual supaya tidak mundur sehari di timezone negatif.
function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) {
    return '-';
  }
  return new Date(year, month - 1, day).toLocaleDateString('id-ID', DATE_FORMAT);
}

interface QuranSurahProgressItemProps {
  item: SurahReadingHistory;
  onPress: (item: SurahReadingHistory) => void;
}

export function QuranSurahProgressItem({
  item,
  onPress,
}: QuranSurahProgressItemProps): React.JSX.Element {
  const percentage = Math.round(
    (item.lastAyah / Math.max(1, item.totalAyah)) * 100,
  );

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.surahNameLatin}, ${
        item.isCompleted ? 'selesai' : `ayat ${item.lastAyah} dari ${item.totalAyah}`
      }`}>
      <View style={styles.numberBadge}>
        <Text style={styles.number}>{item.surahNumber}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.surahNameLatin}
          </Text>
          {item.isCompleted ? (
            <View style={styles.completedBadge}>
              <Text style={styles.completedLabel}>SELESAI</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.subtitle}>
          ayat {item.lastAyah} dari {item.totalAyah} · {percentage}%
        </Text>

        <QuranProgressBar percentage={percentage} />
      </View>

      <Icon icon={AltArrowRight} size={20} color={colors.neutral[400]} />
    </TouchableOpacity>
  );
}

interface QuranJuzProgressItemProps {
  item: JuzReadingHistory;
  onPress: (item: JuzReadingHistory) => void;
}

export function QuranJuzProgressItem({
  item,
  onPress,
}: QuranJuzProgressItemProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`Juz ${item.juzNumber}, ${item.percentage} persen`}>
      <View style={styles.numberBadge}>
        <Text style={styles.number}>{item.juzNumber}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Juz {item.juzNumber}</Text>
        <Text style={styles.subtitle}>
          {item.readAyahCount} dari {item.totalAyahCount} ayat ·{' '}
          {item.percentage}%
        </Text>
        <QuranProgressBar percentage={item.percentage} />
      </View>

      <Icon icon={AltArrowRight} size={20} color={colors.neutral[400]} />
    </TouchableOpacity>
  );
}

interface QuranSavedSurahItemProps {
  item: SavedSurah;
  onPress: (item: SavedSurah) => void;
  onPressDelete: (item: SavedSurah) => void;
}

export function QuranSavedSurahItem({
  item,
  onPress,
  onPressDelete,
}: QuranSavedSurahItemProps): React.JSX.Element {
  function handleAccessibilityAction(event: AccessibilityActionEvent): void {
    if (event.nativeEvent.actionName === 'longpress') {
      onPressDelete(item);
    }
  }

  return (
    // Tanpa tombol hapus yang selalu terlihat — ditahan untuk menghapus,
    // pola yang sama dengan aksi per ayat di reader. Baris jadi bersih dan
    // lebarnya utuh untuk nama surah.
    <Pressable
      style={({pressed}) => [styles.row, pressed && styles.pressed]}
      onPress={() => onPress(item)}
      onLongPress={() => onPressDelete(item)}
      delayLongPress={300}
      accessibilityRole="button"
      accessibilityLabel={`${item.surahNameLatin}, ${item.totalAyah} ayat`}
      // Tekan lama tidak terlihat oleh pengguna screen reader, jadi aksinya
      // didaftarkan dan diberi petunjuk.
      accessibilityHint="Tahan untuk menghapus dari daftar simpan"
      accessibilityActions={[
        {name: 'longpress', label: 'Hapus dari daftar simpan'},
      ]}
      onAccessibilityAction={handleAccessibilityAction}>
      <View style={styles.numberBadge}>
        <Text style={styles.number}>{item.surahNumber}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {item.surahNameLatin}
        </Text>
        <Text style={styles.subtitle}>{item.totalAyah} ayat</Text>
      </View>

      <Text style={styles.arabic} numberOfLines={1}>
        {item.surahNameArabic}
      </Text>
    </Pressable>
  );
}

interface QuranScheduleListCardProps {
  schedule: Schedule;
  onPress: (schedule: Schedule) => void;
  onPressEdit: (schedule: Schedule) => void;
  onPressDelete: (schedule: Schedule) => void;
}

export function QuranScheduleListCard({
  schedule,
  onPress,
  onPressEdit,
  onPressDelete,
}: QuranScheduleListCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => onPress(schedule)}
        accessibilityRole="button"
        accessibilityLabel={`Jadwal ${schedule.surahNameLatin} sampai ayat ${schedule.targetAyah}`}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardDate}>{formatDate(schedule.date)}</Text>
          <QuranStatusBadge status={schedule.status} />
        </View>

        <Text style={styles.cardTitle} numberOfLines={1}>
          {schedule.surahNameLatin}
        </Text>
        <Text style={styles.subtitle}>
          Target sampai ayat {schedule.targetAyah} · {schedule.percentage}%
        </Text>
        <View style={styles.cardProgress}>
          <QuranProgressBar percentage={schedule.percentage} />
        </View>
      </TouchableOpacity>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => onPressEdit(schedule)}
          accessibilityRole="button"
          accessibilityLabel={`Ubah jadwal ${schedule.surahNameLatin}`}>
          <Icon icon={PenNewSquare} size={20} color={colors.neutral[600]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => onPressDelete(schedule)}
          accessibilityRole="button"
          accessibilityLabel={`Hapus jadwal ${schedule.surahNameLatin}`}>
          <Icon
            icon={TrashBinMinimalistic}
            size={20}
            color={colors.semantic.error}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Umpan balik saat ditahan — tanpa ini tekan lama terasa seperti tidak
  // terjadi apa-apa sampai dialog konfirmasi muncul.
  pressed: {
    opacity: 0.6,
  },
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
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flexShrink: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  completedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.semantic.successLight,
  },
  completedLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.semantic.success,
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.neutral[500],
  },
  arabic: {
    fontFamily: fontFamily.arabic,
    flexShrink: 0,
    fontSize: fontSize.lg,
    color: colors.primary[700],
    writingDirection: 'rtl',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cardDate: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[700],
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  cardProgress: {
    marginTop: spacing.sm,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: spacing.xs,
  },
});
