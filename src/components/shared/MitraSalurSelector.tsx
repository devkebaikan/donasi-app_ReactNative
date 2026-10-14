import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {AltArrowDown} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {MitraSalur} from '@/types/programDetail';

interface MitraSalurSelectorProps {
  mitraUtama?: MitraSalur;
  onPress: () => void;
}

export function MitraSalurSelector({
  mitraUtama,
  onPress,
}: MitraSalurSelectorProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Lihat daftar mitra salur">
      {mitraUtama ? (
        <Image
          source={{uri: mitraUtama.photoUrl}}
          style={styles.logo}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={`Logo ${mitraUtama.name}`}
        />
      ) : (
        <View style={styles.logo} />
      )}
      <View style={styles.rightGroup}>
        <Text style={styles.label}>Mitra Salur</Text>
        <Icon icon={AltArrowDown} size={20} color={colors.neutral[600]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral[0],
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
});
