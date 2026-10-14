import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, fontSize, fontWeight, lineHeight, shadows, spacing} from '@/theme';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const CIRCLE_SIZE = SCREEN_WIDTH * 0.58;
const CIRCLE_IMAGE_SIZE = CIRCLE_SIZE * 0.45;
// Tinggi gradient background — pola sama seperti MyDonationsScreen, tapi
// direntangkan fullscreen (bukan 420 fixed) khusus untuk slide onboarding.
const GRADIENT_HEIGHT = SCREEN_HEIGHT;
// Tinggi footer nav (tombol bulat 48 + padding atas/bawah) di OnboardingScreen —
// dipakai sebagai jarak aman supaya title/sub text tidak tertutup.
const FOOTER_RESERVED_HEIGHT = 48 + spacing.lg * 2 + spacing.xl;

export interface OnboardingSlide {
  id: string;
  image: ImageSourcePropType | null;
  backgroundColor: string;
  circleColor: string;
  textColor: string;
  title: string;
  description: string;
}

interface OnboardingSlideItemProps {
  slide: OnboardingSlide;
}

// Floating orbs — mengikuti pola @/components/shared/FloatingOrbs, hanya
// ditint sesuai warna slide (bukan colors.primary yang statis).
function SlideOrbs({color}: {color: string}): React.JSX.Element {
  return (
    <View style={styles.orbsContainer} pointerEvents="none">
      <View style={[styles.orb, styles.orbLarge, {backgroundColor: color}]} />
      <View style={[styles.orb, styles.orbMedium, {backgroundColor: color}]} />
    </View>
  );
}

export function OnboardingSlideItem({
  slide,
}: OnboardingSlideItemProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  // Jarak aman di bawah teks supaya tidak tertutup footer nav (tombol
  // kiri/kanan + skip) yang di-overlay absolut oleh OnboardingScreen.
  const footerClearance = insets.bottom + FOOTER_RESERVED_HEIGHT;

  return (
    <View style={styles.container}>
      {/* Background & orb — pola yang sama dengan MyDonationsScreen,
          ditint sesuai warna slide */}
      <LinearGradient
        colors={[slide.circleColor, slide.backgroundColor, colors.neutral[0]]}
        locations={[0, 0.32, 0.62]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.backgroundGradient}
      />
      <SlideOrbs color={slide.circleColor} />

      <View style={styles.imageContainer}>
        <View style={[styles.circle, {backgroundColor: slide.circleColor}]}>
          {slide.image != null ? (
            <Image
              source={slide.image}
              style={styles.circleImage}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel={slide.title}
            />
          ) : null}
        </View>
      </View>

      {/* Spacer fleksibel — mendorong title & sub text ke bawah layar */}
      <View style={styles.spacer} />

      <View style={[styles.textContainer, {paddingBottom: footerClearance}]}>
        <Text style={[styles.title, {color: slide.textColor}]}>{slide.title}</Text>
        <Text style={[styles.description, {color: slide.textColor}]}>
          {slide.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    overflow: 'hidden',
    backgroundColor: colors.neutral[0],
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: GRADIENT_HEIGHT,
  },
  orbsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbLarge: {
    width: 240,
    height: 240,
    top: -70,
    left: -60,
    opacity: 0.35,
  },
  orbMedium: {
    width: 150,
    height: 150,
    top: 250,
    right: -40,
    opacity: 0.3,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.42,
    justifyContent: 'center',
    paddingLeft: spacing.xl,
  },
  spacer: {
    flex: 1,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  circleImage: {
    width: CIRCLE_IMAGE_SIZE,
    height: CIRCLE_IMAGE_SIZE,
  },
  textContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['2xl'] * lineHeight.tight,
  },
  description: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.lg * lineHeight.normal,
  },
});
