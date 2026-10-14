import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
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
}

export function DonationSortDirectionToggle({
  value,
  onPress,
}: DonationSortDirectionToggleProps): React.JSX.Element {
  const isAsc = value === 'asc';

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        isAsc ? 'Urutan menaik' : 'Urutan menurun'
      }>
      <Icon
        icon={isAsc ? SortFromBottomToTop : SortFromTopToBottom}
        size={20}
        color={colors.neutral[600]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
  },
});
