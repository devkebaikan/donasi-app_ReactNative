import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

const HIT_SLOP = {top: 4, bottom: 4, left: 4, right: 4};

// Tanggal 1–31 dalam grid tujuh kolom. Bentuk lingkarannya sengaja dibuat sama
// dengan DonasiBersamaWeekDayPicker supaya dua pemilih ini — yang muncul di
// tempat yang sama, cuma berganti mengikuti frekuensi — tidak terlihat berasal
// dari aplikasi berbeda. Komponen itu tidak bisa dipakai ulang karena
// nilainya bertipe WeekDay, bukan angka tanggal.
const MONTH_DAYS = Array.from({length: 31}, (_, index) => index + 1);

interface MonthDayPickerProps {
  value: number | null;
  onChange: (day: number) => void;
}

export function MonthDayPicker({
  value,
  onChange,
}: MonthDayPickerProps): React.JSX.Element {
  return (
    <View style={styles.grid}>
      {MONTH_DAYS.map(day => {
        const isSelected = day === value;
        return (
          <TouchableOpacity
            key={day}
            style={[styles.day, isSelected && styles.daySelected]}
            hitSlop={HIT_SLOP}
            onPress={() => onChange(day)}
            accessibilityRole="radio"
            accessibilityLabel={`Tanggal ${day}`}
            accessibilityState={{selected: isSelected}}>
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {day}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  // Tujuh kolom: lebar 14% menyisakan ruang untuk gap di antaranya tanpa perlu
  // mengukur lebar layar.
  day: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    backgroundColor: colors.primary[500],
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
  labelSelected: {
    color: colors.neutral[0],
    fontWeight: fontWeight.semiBold,
  },
});
