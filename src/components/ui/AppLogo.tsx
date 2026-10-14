import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Icon} from '@/components/ui/Icon';
import {HandHeart} from '@solar-icons/react-native/Linear';
import {colors, radius} from '@/theme';

interface AppLogoProps {
  size?: number;
}

export function AppLogo({size = 36}: AppLogoProps): React.JSX.Element {
  return (
    <View
      style={[styles.container, {width: size, height: size}]}
      accessibilityRole="image"
      accessibilityLabel="Logo aplikasi">
      <Icon icon={HandHeart} size={size * 0.6} color={colors.neutral[0]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
