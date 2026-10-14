import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {ScheduleRepeat} from '@/types/quran';

interface RepeatOption {
  value: ScheduleRepeat;
  label: string;
}

export const REPEAT_OPTIONS: RepeatOption[] = [
  {value: 'TIDAK_BERULANG', label: 'Tidak berulang'},
  {value: 'HARIAN', label: 'Harian'},
  {value: 'MINGGUAN', label: 'Mingguan'},
  {value: 'BULANAN', label: 'Bulanan'},
];

export const REPEAT_LABEL: Record<ScheduleRepeat, string> = {
  TIDAK_BERULANG: 'Tidak berulang',
  HARIAN: 'Harian',
  MINGGUAN: 'Mingguan',
  BULANAN: 'Bulanan',
};

interface QuranRepeatSelectorProps {
  value: ScheduleRepeat;
  onChange: (value: ScheduleRepeat) => void;
}

export function QuranRepeatSelector({
  value,
  onChange,
}: QuranRepeatSelectorProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      {REPEAT_OPTIONS.map(option => {
        const isSelected = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={styles.row}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{selected: isSelected, checked: isSelected}}>
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected ? <View style={styles.radioDot} /> : null}
            </View>
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary[500],
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.primary[500],
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.neutral[700],
  },
  labelSelected: {
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
});
