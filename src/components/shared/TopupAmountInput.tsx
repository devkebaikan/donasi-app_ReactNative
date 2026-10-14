import React from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

export interface TopupAmountPreset {
  amount: number;
  label: string;
}

interface TopupAmountInputProps {
  amount: number;
  selectedPreset: number | null;
  presets: TopupAmountPreset[];
  error?: string | null;
  accessibilityLabel?: string;
  onSelectPreset: (amount: number) => void;
  onChangeAmount: (rawDigits: string) => void;
}

function formatAmountDisplay(amount: number): string {
  if (!amount) {
    return '';
  }
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function TopupAmountInput({
  amount,
  selectedPreset,
  presets,
  error = null,
  accessibilityLabel = 'Input nominal saldo',
  onSelectPreset,
  onChangeAmount,
}: TopupAmountInputProps): React.JSX.Element {
  function handleChangeText(value: string): void {
    onChangeAmount(value.replace(/\D/g, ''));
  }

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <Text style={styles.prefix}>Rp</Text>
        <TextInput
          style={styles.input}
          value={formatAmountDisplay(amount)}
          onChangeText={handleChangeText}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.neutral[400]}
          accessibilityLabel={accessibilityLabel}
        />
      </View>
      {error ? (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <View style={styles.presetGrid}>
        {presets.map(preset => {
          const isSelected = selectedPreset === preset.amount;
          return (
            <TouchableOpacity
              key={preset.amount}
              style={[styles.presetItem, isSelected && styles.presetItemSelected]}
              onPress={() => onSelectPreset(preset.amount)}
              accessibilityRole="button"
              accessibilityLabel={preset.label}
              accessibilityState={{selected: isSelected}}>
              <Text
                style={[styles.presetLabel, isSelected && styles.presetLabelSelected]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    backgroundColor: colors.neutral[0],
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  prefix: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
  },
  input: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
    padding: 0,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetItem: {
    flexBasis: '31%',
    flexGrow: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
  },
  presetItemSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  presetLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  presetLabelSelected: {
    color: colors.primary[700],
  },
});
