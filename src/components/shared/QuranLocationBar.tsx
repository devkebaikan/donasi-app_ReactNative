import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon} from '@/components/ui/Icon';
import {MapPoint} from '@solar-icons/react-native/Linear';
import {colors, spacing, fontSize, fontWeight} from '@/theme';

interface QuranLocationBarProps {
  location: string;
  hijriDate: string;
}

// Berdiri di dalam area scroll, tepat di bawah SearchBar milik header —
// bukan bagian dari QuranHomeHeader, jadi ikut tergulung saat halaman
// di-scroll.
export function QuranLocationBar({
  location,
  hijriDate,
}: QuranLocationBarProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Icon icon={MapPoint} size={16} color={colors.primary[600]} />
      <Text style={styles.location} numberOfLines={1}>
        {location}
      </Text>
      <Text style={styles.separator}>·</Text>
      <Text style={styles.date} numberOfLines={1}>
        {hijriDate}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  location: {
    flexShrink: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  separator: {
    fontSize: fontSize.sm,
    color: colors.neutral[400],
  },
  date: {
    flexShrink: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.neutral[500],
  },
});
