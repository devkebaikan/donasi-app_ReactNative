import React from 'react';
import {View, Text, Switch, StyleSheet} from 'react-native';
import {colors, spacing, fontSize, fontWeight} from '@/theme';

interface QuranSettingToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function QuranSettingToggleRow({
  label,
  value,
  onChange,
}: QuranSettingToggleRowProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{false: colors.neutral[300], true: colors.primary[400]}}
        thumbColor={colors.neutral[0]}
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{checked: value}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.neutral[800],
  },
});
