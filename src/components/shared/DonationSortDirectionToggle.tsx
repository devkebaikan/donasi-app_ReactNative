import React from 'react';
import {TouchableOpacity, StyleSheet, StyleProp, ViewStyle} from 'react-native';
import {
  SortFromTopToBottom,
  SortFromBottomToTop,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, radius} from '@/theme';
import type {SortDirection} from '@/types/donationFilter';

interface DonationSortDirectionToggleProps {
  value: SortDirection;
  onPress: () => void;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export function DonationSortDirectionToggle({
  value,
  onPress,
  size = 'sm',
  style,
}: DonationSortDirectionToggleProps): React.JSX.Element {
  const isAsc = value === 'asc';
  const isMd = size === 'md';

  return (
    <TouchableOpacity
      style={[isMd ? styles.buttonMd : styles.buttonSm, style]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={
        isAsc ? 'Urutan menaik' : 'Urutan menurun'
      }>
      <Icon
        icon={isAsc ? SortFromBottomToTop : SortFromTopToBottom}
        size={isMd ? 20 : 16}
        color={colors.neutral[600]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonSm: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  buttonMd: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
  },
});
