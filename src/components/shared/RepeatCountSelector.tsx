import React, {useState} from 'react';
import {View, Text, TouchableOpacity, TextInput, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

const REPEAT_PRESETS = [7, 30, 100];

interface RepeatCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
  error?: string | null;
}

export function RepeatCountSelector({
  value,
  onChange,
  error,
}: RepeatCountSelectorProps): React.JSX.Element {
  const isPreset = REPEAT_PRESETS.includes(value);
  const [customValue, setCustomValue] = useState(isPreset ? '' : String(value));

  function handleSelectPreset(preset: number): void {
    setCustomValue('');
    onChange(preset);
  }

  function handleChangeCustom(text: string): void {
    const digits = text.replace(/\D/g, '');
    setCustomValue(digits);
    onChange(digits ? Number(digits) : 0);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Jumlah Pengulangan</Text>
      <View style={styles.presetRow}>
        {REPEAT_PRESETS.map(preset => {
          const isSelected = customValue === '' && value === preset;
          return (
            <TouchableOpacity
              key={preset}
              style={[styles.presetItem, isSelected && styles.presetItemSelected]}
              onPress={() => handleSelectPreset(preset)}
              accessibilityRole="radio"
              accessibilityLabel={`${preset} kali`}
              accessibilityState={{selected: isSelected}}>
              <Text
                style={[
                  styles.presetLabel,
                  isSelected && styles.presetLabelSelected,
                ]}>
                {preset}x
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.customRow, error && styles.customRowError]}>
        <Text style={styles.customLabel}>Custom</Text>
        <TextInput
          style={styles.customInput}
          value={customValue}
          onChangeText={handleChangeCustom}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.neutral[400]}
          accessibilityLabel="Jumlah pengulangan custom"
        />
        <Text style={styles.customSuffix}>Kali</Text>
      </View>
      {error ? (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
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
  presetRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  presetItem: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.lg,
  },
  presetItemSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  presetLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  presetLabelSelected: {
    color: colors.primary[700],
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  customRowError: {
    borderColor: colors.semantic.error,
  },
  customLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  customInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    padding: 0,
    textAlign: 'right',
  },
  customSuffix: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
});
