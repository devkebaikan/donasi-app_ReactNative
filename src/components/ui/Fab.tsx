import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';
import {colors, spacing, radius, shadows} from '@/theme';

const FAB_SIZE = 56;

interface FabProps {
  icon: SolarIconComponent;
  accessibilityLabel: string;
  onPress: () => void;
}

// Floating action button generic — sebelumnya DoaFab, diangkat ke sini saat
// menu Amalan Harian butuh FAB kedua. Jarak bawahnya menghitung safe area
// sendiri supaya tidak tertimpa gesture bar iOS.
export function Fab({
  icon,
  accessibilityLabel,
  onPress,
}: FabProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[styles.fab, {bottom: insets.bottom + spacing.lg}]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      <Icon icon={icon} size={24} color={colors.neutral[0]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
});
