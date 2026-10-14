import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {QuranStatusBadge} from '@/components/shared/QuranStatusBadge';
import {QuranProgressBar} from '@/components/shared/QuranProgressBar';
import {
  aurora,
  colors,
  quranCardGradient,
  spacing,
  radius,
  fontSize,
  fontWeight,
} from '@/theme';
import type {Schedule} from '@/types/quran';

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

// Tanggal dipecah manual, bukan lewat new Date(isoDate). String date-only
// diparse sebagai UTC oleh JS, sehingga di timezone negatif tanggalnya
// mundur satu hari saat diformat ke waktu lokal.
function formatScheduleDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) {
    return '-';
  }
  return new Date(year, month - 1, day).toLocaleDateString('id-ID', DATE_FORMAT);
}

interface QuranScheduleCardProps {
  schedule: Schedule;
  width: number;
  onPress: (schedule: Schedule) => void;
}

export function QuranScheduleCard({
  schedule,
  width,
  onPress,
}: QuranScheduleCardProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.card, {width}]}
      onPress={() => onPress(schedule)}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`Jadwal ${schedule.surahNameLatin} sampai ayat ${schedule.targetAyah}, ${schedule.percentage} persen`}>
      <LinearGradient
        colors={quranCardGradient.colors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradient}
      />

      {/* Tanggal di kiri, status di kanan atas — satu baris. */}
      <View style={styles.header}>
        <Text style={styles.date} numberOfLines={1}>
          {formatScheduleDate(schedule.date)}
        </Text>
        <QuranStatusBadge status={schedule.status} />
      </View>

      {/* Nama surah jadi teks terbesar — itu isi jadwalnya, sejajar peran
          "Hari ke-N" di kartu challenge. */}
      <Text style={styles.surah} numberOfLines={1}>
        {schedule.surahNameLatin}
      </Text>

      {/* Target di kiri, persentase di kanan — satu baris, bar di bawahnya. */}
      <View style={styles.metaRow}>
        <Text style={styles.target} numberOfLines={1}>
          Target sampai ayat {schedule.targetAyah}
        </Text>
        <Text style={styles.percentage}>{schedule.percentage}%</Text>
      </View>

      <QuranProgressBar
        percentage={schedule.percentage}
        trackColor={aurora.glassOverlay}
        fillColor={colors.secondary[500]}
      />

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    overflow: 'hidden',
    // Tepi putih tipis, bukan garis berwarna — supaya gradient tidak terkunci
    // di satu sisi. Sama dengan kartu challenge.
    borderWidth: 1,
    borderColor: aurora.glassBorder,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  date: {
    flexShrink: 1,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * 1.4,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
    color: colors.primary[700],
  },
  surah: {
    fontSize: fontSize['2xl'],
    lineHeight: fontSize['2xl'] * 1.15,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  target: {
    flexShrink: 1,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.4,
    fontWeight: fontWeight.regular,
    color: colors.neutral[600],
  },
  percentage: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * 1.3,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
});
