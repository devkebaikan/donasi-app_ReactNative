import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {List, Widget} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius} from '@/theme';
import type {ViewMode} from '@/types/donationFilter';

interface DonationListToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function DonationListToggle({
  value,
  onChange,
}: DonationListToggleProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, value === 'list' && styles.buttonActive]}
        onPress={() => onChange('list')}
        accessibilityRole="button"
        accessibilityLabel="Tampilan list"
        accessibilityState={{selected: value === 'list'}}>
        <Icon
          icon={List}
          size={20}
          color={value === 'list' ? colors.neutral[0] : colors.neutral[600]}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, value === 'grid' && styles.buttonActive]}
        onPress={() => onChange('grid')}
        accessibilityRole="button"
        accessibilityLabel="Tampilan grid"
        accessibilityState={{selected: value === 'grid'}}>
        <Icon
          icon={Widget}
          size={20}
          color={value === 'grid' ? colors.neutral[0] : colors.neutral[600]}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    padding: spacing.xs / 2,
  },
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  buttonActive: {
    backgroundColor: colors.primary[500],
  },
});
