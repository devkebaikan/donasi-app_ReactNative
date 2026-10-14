import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {AltArrowDown} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

interface ReportPeriodRowProps {
  label: string;
  isEnabled: boolean;
  onPress: () => void;
}

// Seluruh baris bisa ditekan, bukan cuma chevron-nya. Dimatikan saat tidak ada
// periode lain untuk dipilih — menekan baris yang membuka sheet kosong itu
// jalan buntu.
export function ReportPeriodRow({
  label,
  isEnabled,
  onPress,
}: ReportPeriodRowProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!isEnabled}
      accessibilityRole="button"
      accessibilityState={{disabled: !isEnabled}}
      accessibilityLabel={`Periode Laporan, ${label}. Ketuk untuk memilih periode lain`}>
      <Text style={styles.label}>Periode Laporan</Text>
      <View style={styles.value}>
        <Text style={styles.valueText}>{label}</Text>
        {isEnabled ? (
          <Icon icon={AltArrowDown} size={20} color={colors.neutral[500]} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  value: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  valueText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
});
