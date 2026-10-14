import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {TantanganMode} from '@/types/tantangan';

interface ModeOption {
  value: TantanganMode;
  label: string;
}

const MODE_OPTIONS: ModeOption[] = [
  {value: 'personal', label: 'Personal'},
  {value: 'group', label: 'Berjamaah'},
];

interface TantanganModeToggleProps {
  value: TantanganMode;
  onChange: (mode: TantanganMode) => void;
  /** Dikunci saat tantangan sudah punya peserta lain. Default: false. */
  isLocked?: boolean;
}

// Pemilih dua segmen, bentuknya mengikuti DonationListToggle/TantanganTabBar.
// BUKAN DonationOptionToggle — meski namanya mirip, isinya label + Switch
// (biner nyala/mati), bukan pemilih antar dua nilai.
export function TantanganModeToggle({
  value,
  onChange,
  isLocked = false,
}: TantanganModeToggleProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      {MODE_OPTIONS.map(option => {
        const isActive = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.segment, isActive && styles.segmentActive]}
            disabled={isLocked}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{selected: isActive, disabled: isLocked}}
            accessibilityLabel={`Mode ${option.label}`}>
            <Text
              style={[
                styles.label,
                isActive && styles.labelActive,
                isLocked && styles.labelLocked,
              ]}
              numberOfLines={1}>
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
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
  },
  segmentActive: {
    backgroundColor: colors.neutral[0],
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
  },
  labelActive: {
    color: colors.primary[600],
    fontWeight: fontWeight.semiBold,
  },
  labelLocked: {
    color: colors.neutral[400],
  },
});
