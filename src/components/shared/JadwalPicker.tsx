import React from 'react';
import {View, Text, TouchableOpacity, TextInput, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {RecurringFrequency} from '@/types/recurringDonation';

interface FrequencyOption {
  value: RecurringFrequency;
  label: string;
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {value: 'harian', label: 'Harian'},
  {value: 'mingguan', label: 'Mingguan'},
  {value: 'bulanan', label: 'Bulanan'},
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

interface JadwalPickerProps {
  frequency: RecurringFrequency;
  onChangeFrequency: (frequency: RecurringFrequency) => void;
  scheduleHour: number;
  scheduleMinute: number;
  onChangeHour: (hour: number) => void;
  onChangeMinute: (minute: number) => void;
}

export function JadwalPicker({
  frequency,
  onChangeFrequency,
  scheduleHour,
  scheduleMinute,
  onChangeHour,
  onChangeMinute,
}: JadwalPickerProps): React.JSX.Element {
  function handleChangeHour(value: string): void {
    const digits = value.replace(/\D/g, '');
    if (digits === '') {
      onChangeHour(0);
      return;
    }
    onChangeHour(clamp(Number(digits), 0, 23));
  }

  function handleChangeMinute(value: string): void {
    const digits = value.replace(/\D/g, '');
    if (digits === '') {
      onChangeMinute(0);
      return;
    }
    onChangeMinute(clamp(Number(digits), 0, 59));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Donasi setiap</Text>
      <View style={styles.frequencyRow}>
        {FREQUENCY_OPTIONS.map(option => {
          const isSelected = option.value === frequency;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.frequencyChip, isSelected && styles.frequencyChipSelected]}
              onPress={() => onChangeFrequency(option.value)}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{selected: isSelected}}>
              <Text
                style={[
                  styles.frequencyLabel,
                  isSelected && styles.frequencyLabelSelected,
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Pukul</Text>
      <View style={styles.timeRow}>
        <TextInput
          style={styles.timeInput}
          value={pad(scheduleHour)}
          onChangeText={handleChangeHour}
          keyboardType="number-pad"
          maxLength={2}
          accessibilityLabel="Jam jadwal donasi"
        />
        <Text style={styles.timeSeparator}>:</Text>
        <TextInput
          style={styles.timeInput}
          value={pad(scheduleMinute)}
          onChangeText={handleChangeMinute}
          keyboardType="number-pad"
          maxLength={2}
          accessibilityLabel="Menit jadwal donasi"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  frequencyChip: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
  },
  frequencyChipSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  frequencyLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  frequencyLabelSelected: {
    color: colors.primary[700],
    fontWeight: fontWeight.semiBold,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeInput: {
    width: 56,
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    textAlign: 'center',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  timeSeparator: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[500],
  },
});
