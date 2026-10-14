import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontWeight, fontSize} from '@/theme';
import {toLocalDate} from '@/utils/formatDate';
import type {AmalanSummary} from '@/types/amalan';

// Senin dan Selasa sengaja tidak sama-sama "Se" — kalau dipotong dua huruf
// keduanya identik dan strip jadi tidak terbaca.
const DAY_INITIALS = ['Mi', 'Se', 'Sel', 'Ra', 'Ka', 'Ju', 'Sa'];

const HIT_SLOP = {top: 4, bottom: 4, left: 4, right: 4};

interface AmalanDateStripProps {
  summaries: AmalanSummary[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

// Struktur dan style lingkaran mengikuti DonasiRutinCalendar. Komponennya
// terpisah karena props di sana terikat domain donasi (streakDays,
// has_donation) dan tidak bisa dipakai ulang apa adanya.
export function AmalanDateStrip({
  summaries,
  selectedDate,
  onSelectDate,
}: AmalanDateStripProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      {summaries.map(summary => {
        const date = toLocalDate(summary.date);
        const isSelected = summary.date === selectedDate;
        // Hari kosong tidak dapat titik — 0 dari 0 bukan pencapaian.
        const isComplete = summary.total > 0 && summary.done === summary.total;

        return (
          <TouchableOpacity
            key={summary.date}
            style={styles.item}
            onPress={() => onSelectDate(summary.date)}
            hitSlop={HIT_SLOP}
            accessibilityRole="button"
            accessibilityState={{selected: isSelected}}
            accessibilityLabel={`${date.toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}, ${summary.done} dari ${summary.total} amalan selesai`}>
            <Text
              style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
              {DAY_INITIALS[date.getDay()]}
            </Text>
            <View style={[styles.circle, isSelected && styles.circleSelected]}>
              <Text
                style={[styles.dateText, isSelected && styles.dateTextSelected]}>
                {date.getDate()}
              </Text>
            </View>
            <View style={[styles.dot, isComplete && styles.dotVisible]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayLabel: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.xs,
    color: colors.neutral[600],
  },
  dayLabelSelected: {
    color: colors.primary[700],
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  circleSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  dateText: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.md,
    color: colors.neutral[700],
  },
  dateTextSelected: {
    color: colors.neutral[0],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: 'transparent',
  },
  dotVisible: {
    backgroundColor: colors.secondary[500],
  },
});
