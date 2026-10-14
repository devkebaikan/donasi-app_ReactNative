import React from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import {MapPoint} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, fontWeight, fontSize, glass, radius, spacing} from '@/theme';

interface PrayerLocationChipProps {
  location: string;
  onPress: () => void;
}

export function PrayerLocationChip({
  location,
  onPress,
}: PrayerLocationChipProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.chip}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Lokasi ${location}. Ubah lokasi`}>
      <Icon icon={MapPoint} size={16} color={colors.primary[700]} />
      <Text style={styles.label} numberOfLines={1}>
        {location}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    maxWidth: '70%',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: glass.tintHeavy,
  },
  label: {
    flexShrink: 1,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.neutral[800],
  },
});
