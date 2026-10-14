import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, spacing, radius} from '@/theme';

// Tinggi, radius, dan tata letaknya menyamai AmalanRow supaya daftar tidak
// melompat saat data datang.
export function AmalanRowSkeleton(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.circle} />
      <View style={styles.body}>
        <View style={styles.lineShort} />
        <View style={styles.lineLong} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
  },
  body: {
    flex: 1,
    gap: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  lineShort: {
    width: 56,
    height: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[200],
  },
  lineLong: {
    width: '70%',
    height: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[200],
  },
});
