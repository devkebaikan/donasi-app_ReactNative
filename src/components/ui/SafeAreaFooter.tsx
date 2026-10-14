import React from 'react';
import {View, StyleSheet} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing} from '@/theme';

interface SafeAreaFooterProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Tampilkan garis pemisah di atas footer. Default: true. */
  withBorder?: boolean;
}

export function SafeAreaFooter({
  children,
  style,
  withBorder = true,
}: SafeAreaFooterProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        withBorder && styles.withBorder,
        {paddingBottom: insets.bottom + spacing.md},
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.neutral[0],
  },
  withBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral[200],
  },
});
