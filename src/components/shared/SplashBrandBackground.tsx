import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors} from '@/theme';
import {FloatingOrbs} from '@/components/shared/FloatingOrbs';

const LOGO = require('@/assets/images/primary-logo.png');

// Background bermerek untuk jeda singkat antara JS siap dan navigasi
// selesai (baca hasOnboarded / redirect ke Home) — pengganti View polos
// di SplashScreen. Purely presentational, tidak ada props/state.
export function SplashBrandBackground(): React.JSX.Element {
  return (
    <View style={styles.container} accessible={false}>
      <LinearGradient
        colors={[colors.primary[200], colors.primary[50], colors.neutral[0]]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.backgroundGradient}
      />
      <FloatingOrbs />
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[0],
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logo: {
    width: 160,
    height: 160,
  },
});
