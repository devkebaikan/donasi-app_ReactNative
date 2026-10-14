import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {RecurringStatusFilter} from '@/types/recurringDonation';

interface ChipOption {
  value: RecurringStatusFilter;
  label: string;
}

// Target sentuh tetap 44 lewat hitSlop, jadi chip boleh tampil serendah 36
// tanpa melanggar standar aksesibilitas.
const CHIP_HIT_SLOP = {top: 4, bottom: 4, left: 0, right: 0};

const CHIP_OPTIONS: ChipOption[] = [
  {value: 'semua', label: 'Semua'},
  {value: 'aktif', label: 'Aktif'},
  {value: 'jeda', label: 'Jeda'},
];

// Penyaring status rutinitas. Bentuk pill mengikuti TantanganCategoryChips,
// tanpa ScrollView horizontal — tiga chip selalu muat dalam satu baris.
export function RecurringStatusChips({
  value,
  onChange,
}: {
  value: RecurringStatusFilter;
  onChange: (filter: RecurringStatusFilter) => void;
}): React.JSX.Element {
  return (
    <View style={styles.row}>
      {CHIP_OPTIONS.map(option => {
        const isSelected = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.chip, isSelected && styles.chipSelected]}
            hitSlop={CHIP_HIT_SLOP}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={`Tampilkan rutinitas ${option.label.toLowerCase()}`}
            accessibilityState={{selected: isSelected}}>
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
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
  },
  chipSelected: {
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
