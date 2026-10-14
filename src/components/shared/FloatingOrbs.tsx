import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors} from '@/theme';

// Dekorasi 3 lingkaran lembut (ukuran & opacity berbeda) di belakang
// header glassmorphism — memberi kedalaman pastel yang "diserap" BlurView.
export function FloatingOrbs(): React.JSX.Element {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={[styles.orb, styles.orbLarge]} />
      <View style={[styles.orb, styles.orbMedium]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 999,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  // Orb hijau (primary) — sisi kiri.
  orbLarge: {
    width: 240,
    height: 240,
    top: -70,
    left: -60,
    backgroundColor: colors.primary[200],
    opacity: 0.35,
  },
  // orbSmall: {
  //   width: 90,
  //   height: 90,
  //   top: 180,
  //   left: 20,
  //   backgroundColor: colors.primary[400],
  //   opacity: 0.25,
  // },
  // Orb oranye (secondary) — sisi kanan.
  orbMedium: {
    width: 150,
    height: 150,
    top: 250,
    right: -40,
    backgroundColor: colors.primary[200],
    opacity: 0.3,
  },
});
