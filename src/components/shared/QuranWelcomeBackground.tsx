import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors, quranWelcomeGradient} from '@/theme';

const BACKGROUND = require('@/assets/images/mosque_illustration.png');

// Background QuranWelcomeScreen: image full-bleed dengan gradient hijau
// yang menguat ke bawah, supaya teks putih di paruh bawah tetap terbaca.
// Purely presentational, tidak ada props/state.
export function QuranWelcomeBackground(): React.JSX.Element {
  return (
    <View style={styles.container} accessible={false}>
      <Image source={BACKGROUND} style={styles.image} resizeMode="cover" />
      <LinearGradient
        colors={quranWelcomeGradient.colors}
        locations={quranWelcomeGradient.locations}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={styles.gradient}
      />
    </View>
  );
}

const FILL = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const;

const styles = StyleSheet.create({
  container: {
    ...FILL,
    backgroundColor: colors.primary[800],
  },
  image: {
    ...FILL,
    width: '100%',
    height: '100%',
  },
  gradient: FILL,
});
