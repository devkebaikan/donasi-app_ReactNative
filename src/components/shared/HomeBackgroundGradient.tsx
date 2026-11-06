import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '@/theme';

interface HomeBackgroundGradientProps {
  children: React.ReactNode;
}

export function HomeBackgroundGradient({
  children,
}: HomeBackgroundGradientProps): React.JSX.Element {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[colors.primary[200], colors.neutral[0], colors.neutral[0]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.background}
      />

      {/* Floating Orbs — Glassmorphism Pastel */}
      <View style={styles.orbsContainer}>
        {/* Orb hijau (primary) — sisi kiri */}
        <View style={[styles.orb, styles.orbLargeGreen]} />

        {/* Orb oranye (secondary) — sisi kanan */}
        <View style={[styles.orb, styles.orbMediumOrange]} />

        {/* Orb ketiga (ukuran kecil) */}
        <View style={[styles.orb, styles.orbSmall]} />
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: 1000,
  },
  orbsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 700,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  // Orb hijau (primary) — ukuran besar, sisi kiri atas
  orbLargeGreen: {
    width: 240,
    height: 240,
    top: -80,
    left: -60,
    backgroundColor: colors.primary[300],
    opacity: 0.35,
  },
  // Orb oranye (secondary) — ukuran menengah, sisi kanan
  orbMediumOrange: {
    width: 150,
    height: 150,
    top: 250,
    right: -30,
    backgroundColor: colors.primary[300],
    opacity: 0.3,
  },
  // Orb kecil — tambahan untuk depth
  orbSmall: {
    width: 80,
    height: 80,
    top: 420,
    left: 50,
    backgroundColor: colors.primary[400],
    opacity: 0.25,
  },
});
