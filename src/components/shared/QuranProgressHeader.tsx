import React from 'react';
import {View, Text, StatusBar, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {FloatingOrbs} from '@/components/shared/FloatingOrbs';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

interface QuranProgressHeaderProps {
  completedSurahCount: number;
  completedJuzCount: number;
}

export function QuranProgressHeader({
  completedSurahCount,
  completedJuzCount,
}: QuranProgressHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingTop: insets.top + spacing.lg}]}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={[colors.primary[200], colors.primary[50], colors.neutral[0]]}
        style={styles.gradient}
      />
      <FloatingOrbs />

      <Text style={styles.title}>Progres</Text>

      <View style={styles.card}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{completedSurahCount}</Text>
          <Text style={styles.statLabel}>Surah</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{completedJuzCount}</Text>
          <Text style={styles.statLabel}>Juz</Text>
        </View>
        <View style={styles.caption}>
          <Text style={styles.captionText}>Selesai dibaca</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.primary[50],
    gap: spacing.lg,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  statLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.primary[200],
  },
  caption: {
    flex: 1,
  },
  captionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.neutral[600],
  },
});
