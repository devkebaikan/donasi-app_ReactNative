import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, spacing, radius, shadows} from '@/theme';

const AVATAR_SIZE = 40;

// Bentuknya sengaja mengikuti DoaCard (padding, radius, tinggi baris) supaya
// list tidak "melompat" saat data asli datang.
export function DoaCardSkeleton(): React.JSX.Element {
  return (
    <View style={styles.card} accessibilityElementsHidden>
      <View style={styles.authorRow}>
        <View style={styles.avatar} />
        <View style={styles.authorInfo}>
          <View style={[styles.line, styles.nameLine]} />
          <View style={[styles.line, styles.timeLine]} />
        </View>
      </View>

      <View style={styles.contentBlock}>
        <View style={styles.line} />
        <View style={styles.line} />
        <View style={[styles.line, styles.lastLine]} />
      </View>

      <View style={styles.divider} />

      <View style={[styles.line, styles.actionLine]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
  },
  authorInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  contentBlock: {
    gap: spacing.sm,
  },
  line: {
    height: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[100],
  },
  nameLine: {
    width: '45%',
  },
  timeLine: {
    width: '30%',
    height: 10,
  },
  lastLine: {
    width: '70%',
  },
  actionLine: {
    width: '55%',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    borderStyle: 'dashed',
  },
});
