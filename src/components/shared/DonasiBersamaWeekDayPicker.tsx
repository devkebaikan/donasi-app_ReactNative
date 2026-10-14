import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {WeekDay} from '@/types/donasiBersama';

interface DayOption {
  value: WeekDay;
  initial: string;
  name: string;
}

// Urut Minggu–Sabtu mengikuti penanggalan yang dipakai menu lain di app ini.
// `initial` sengaja bisa kembar (S untuk Senin, Selasa, Sabtu) — itu memang
// tampilan yang diminta design, dan accessibilityLabel memakai nama penuh.
const DAY_OPTIONS: DayOption[] = [
  {value: 'sun', initial: 'M', name: 'Minggu'},
  {value: 'mon', initial: 'S', name: 'Senin'},
  {value: 'tue', initial: 'S', name: 'Selasa'},
  {value: 'wed', initial: 'R', name: 'Rabu'},
  {value: 'thu', initial: 'K', name: 'Kamis'},
  {value: 'fri', initial: 'J', name: 'Jumat'},
  {value: 'sat', initial: 'S', name: 'Sabtu'},
];

const HIT_SLOP = {top: 8, bottom: 8, left: 4, right: 4};

interface DonasiBersamaWeekDayPickerProps {
  value: WeekDay | null;
  onChange: (day: WeekDay) => void;
}

export function DonasiBersamaWeekDayPicker({
  value,
  onChange,
}: DonasiBersamaWeekDayPickerProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      {DAY_OPTIONS.map(option => {
        const isSelected = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.day, isSelected && styles.daySelected]}
            hitSlop={HIT_SLOP}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.name}
            accessibilityState={{selected: isSelected}}>
            <Text
              style={[styles.initial, isSelected && styles.initialSelected]}>
              {option.initial}
            </Text>
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
  day: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 44,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    backgroundColor: colors.primary[500],
  },
  initial: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
  initialSelected: {
    color: colors.neutral[0],
    fontWeight: fontWeight.semiBold,
  },
});
