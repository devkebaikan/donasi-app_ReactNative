import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  IMPACT_MARKER_COLOR,
  IMPACT_MARKER_KINDS,
  IMPACT_MARKER_LABEL,
} from '@/screens/impact/impactColors';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {ImpactMarkerKind} from '@/types/impact';

// Legenda ditaruh DI BAWAH peta, bukan mengambang di atasnya: sebagai overlay
// di sudut kanan bawah ia menutupi Maluku dan Papua Barat — dua wilayah yang
// justru punya data. Bentuknya baris mendatar yang boleh membungkus supaya
// tetap muat di layar sempit.
export function ImpactMapLegend(): React.JSX.Element {
  return (
    <View style={styles.container} accessibilityRole="text">
      {IMPACT_MARKER_KINDS.map(kind => (
        <View key={kind} style={styles.item}>
          <View style={[styles.dot, dotStyles[kind]]} />
          <Text style={styles.label}>{IMPACT_MARKER_LABEL[kind]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: spacing.md,
    rowGap: spacing.xs,
    marginTop: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
});

// Dipisah dari `styles` karena key-nya ImpactMarkerKind, bukan nama style
// bebas — supaya TypeScript menjamin ketiga jenis punya warnanya.
const dotStyles = StyleSheet.create<
  Record<ImpactMarkerKind, {backgroundColor: string}>
>({
  participant: {backgroundColor: IMPACT_MARKER_COLOR.participant},
  village: {backgroundColor: IMPACT_MARKER_COLOR.village},
  bummas: {backgroundColor: IMPACT_MARKER_COLOR.bummas},
});
