import React from 'react';
import {View, StyleSheet} from 'react-native';
import {CheckCircle} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors} from '@/theme';

export function CategorySelectedBadge(): React.JSX.Element {
  return (
    <View style={styles.badge}>
      <Icon icon={CheckCircle} size={16} color={colors.primary[500]} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.neutral[0],
    borderRadius: 8,
  },
});
