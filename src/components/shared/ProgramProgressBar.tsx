import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, radius} from '@/theme';

interface ProgramProgressBarProps {
  progress: number;
}

export function ProgramProgressBar({
  progress,
}: ProgramProgressBarProps): React.JSX.Element {
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{min: 0, max: 100, now: progress}}>
      <View style={[styles.fill, {width: `${progress}%`}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.secondary[500],
    borderRadius: radius.full,
  },
});
