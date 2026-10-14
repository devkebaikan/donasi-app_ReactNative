import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {AltArrowDown} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {PrayerSettingRow} from '@/components/shared/PrayerSettingRow';
import {colors, fontWeight, fontSize, spacing} from '@/theme';

interface PrayerSettingSelectRowProps {
  label: string;
  description?: string;
  // Nilai yang tampil di kanan baris. Kosongkan untuk baris yang nilainya
  // sudah ditulis sebagai sub label (mis. Lokasi, Metode Perhitungan).
  value?: string;
  onPress: () => void;
}

export function PrayerSettingSelectRow({
  label,
  description,
  value,
  onPress,
}: PrayerSettingSelectRowProps): React.JSX.Element {
  return (
    <PrayerSettingRow
      label={label}
      description={description}
      onPress={onPress}
      accessibilityLabel={
        value ? `${label}, ${value}` : `${label}, ${description ?? ''}`
      }
      rightSlot={
        value ? (
          <View style={styles.valueGroup}>
            <Text style={styles.value} numberOfLines={1}>
              {value}
            </Text>
            <Icon icon={AltArrowDown} size={18} color={colors.neutral[500]} />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  valueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: '45%',
  },
  value: {
    flexShrink: 1,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    color: colors.neutral[700],
  },
});
