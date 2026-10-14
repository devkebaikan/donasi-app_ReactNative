import React from 'react';
import {View, Text, TextInput, Switch, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize} from '@/theme';

interface DonationOptionToggleProps {
  label: string;
  sublabel?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  inputPlaceholder?: string;
  multiline?: boolean;
}

export function DonationOptionToggle({
  label,
  sublabel,
  value,
  onValueChange,
  inputValue,
  onInputChange,
  inputPlaceholder,
  multiline = false,
}: DonationOptionToggleProps): React.JSX.Element {
  const showInput = value && onInputChange !== undefined;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.labelWrapper}>
          <Text style={styles.label}>{label}</Text>
          {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
        </View>
        <Switch
          style={styles.switch}
          value={value}
          onValueChange={onValueChange}
          trackColor={{false: colors.neutral[300], true: colors.primary[400]}}
          thumbColor={colors.neutral[0]}
          accessibilityRole="switch"
          accessibilityLabel={sublabel ? `${label} ${sublabel}` : label}
        />
      </View>
      {showInput ? (
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={inputValue}
          onChangeText={onInputChange}
          placeholder={inputPlaceholder}
          placeholderTextColor={colors.neutral[400]}
          multiline={multiline}
          accessibilityLabel={inputPlaceholder ?? label}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  labelWrapper: {
    flex: 1,
    gap: 2,
  },
  switch: {
    alignSelf: 'center',
  },
  label: {
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
  sublabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[0],
  },
  inputMultiline: {
    height: 88,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
});
