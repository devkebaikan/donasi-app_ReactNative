import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, fontWeight, fontSize, spacing} from '@/theme';

interface PrayerSettingRowProps {
  label: string;
  description?: string;
  rightSlot?: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}

// Satu baris pengaturan: label, sub label (penjelas atau nilai sekarang), dan
// slot kontrol di kanan. Baris tanpa onPress dipakai untuk kontrol yang sudah
// bisa ditekan sendiri, mis. Switch.
export function PrayerSettingRow({
  label,
  description,
  rightSlot,
  onPress,
  accessibilityLabel,
}: PrayerSettingRowProps): React.JSX.Element {
  const content = (
    <>
      <View style={styles.textGroup}>
        <Text style={styles.label}>{label}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
      {rightSlot}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
  description: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
});
