import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, radius} from '@/theme';
import {REFLECTION_CARD_ASPECT_RATIO} from './ReflectionCard';

export function ReflectionCardSkeleton(): React.JSX.Element {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: REFLECTION_CARD_ASPECT_RATIO,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[200],
  },
});
