import React from 'react';
import {View, TouchableOpacity, StyleSheet, StyleProp, ViewStyle} from 'react-native';
import {List, Widget} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, radius} from '@/theme';
import type {ViewMode} from '@/types/donationFilter';

interface DonationListToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  style?: StyleProp<ViewStyle>;
}

export function DonationListToggle({
  value,
  onChange,
  style,
}: DonationListToggleProps): React.JSX.Element {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.button, value === 'list' && styles.buttonActive]}
        onPress={() => onChange('list')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Tampilan list"
        accessibilityState={{selected: value === 'list'}}>
        <Icon
          icon={List}
          size={16}
          color={value === 'list' ? colors.primary[600] : colors.neutral[400]}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, value === 'grid' && styles.buttonActive]}
        onPress={() => onChange('grid')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Tampilan grid"
        accessibilityState={{selected: value === 'grid'}}>
        <Icon
          icon={Widget}
          size={16}
          color={value === 'grid' ? colors.primary[600] : colors.neutral[400]}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  button: {
    width: 30,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  buttonActive: {
    backgroundColor: colors.neutral[0],
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
});
