import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, spacing, fontSize, fontWeight} from '@/theme';

interface QuranGreetingCardProps {
  userName: string;
}

// Berada tepat di bawah QuranLocationBar, masih di dalam area scroll dan di
// atas gradient latar — tanpa latar kartu sendiri supaya terbaca menyatu
// dengan baris lokasi di atasnya.
export function QuranGreetingCard({
  userName,
}: QuranGreetingCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.greeting}>Assalamualaikum</Text>
      <Text style={styles.name} numberOfLines={1}>
        {userName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  greeting: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.neutral[600],
  },
  name: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
});
