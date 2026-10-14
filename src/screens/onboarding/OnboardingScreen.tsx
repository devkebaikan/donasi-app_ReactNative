import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  OnboardingSlideItem,
  type OnboardingSlide,
} from '@/components/ui/OnboardingSlideItem';
import {Icon} from '@/components/ui/Icon';
import {AltArrowLeft, AltArrowRight} from '@solar-icons/react-native/Linear';
import {colors, fontSize, fontWeight, radius, shadows, spacing} from '@/theme';
import type {RootStackNavigationProp} from '@/types/navigation';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const WRAP_JUMP_DELAY_MS = 300;

const ONBOARDING_LOGO = require('@/assets/images/primary-logo.png');

// Warna slide diambil dari palet sistem (@/theme), bukan hex custom —
// primary (teal/hijau brand), semantic.warning (kuning, tidak ada skala
// penuh di sistem sehingga circle & text memakai token yang sama), dan
// secondary (merah/coral brand).
const REAL_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    image: ONBOARDING_LOGO,
    backgroundColor: colors.primary[100],
    circleColor: colors.primary[700],
    textColor: colors.primary[700],
    title: 'Mudah & Aman',
    description:
      'Salurkan kebaikan ke program terpercaya dengan mudah dan aman dari mana saja.',
  },
  {
    id: '2',
    image: ONBOARDING_LOGO,
    backgroundColor: colors.semantic.warningLight,
    circleColor: colors.semantic.warning,
    textColor: colors.semantic.warning,
    title: 'Pantau Dampak mu',
    description:
      'Lihat penyaluran dana secara transparan dan rasakan dampak nyata mu.',
  },
  {
    id: '3',
    image: ONBOARDING_LOGO,
    backgroundColor: colors.secondary[100],
    circleColor: colors.secondary[700],
    textColor: colors.secondary[700],
    title: 'Rutin Otomatis',
    description:
      'Jadwalkan sedekah harian, mingguan, atau bulanan tanpa perlu repot.',
  },
];

const REAL_COUNT = REAL_SLIDES.length;

// Extended list: [klon_last, s1, s2, s3, klon_first]
const EXTENDED_SLIDES: OnboardingSlide[] = [
  {...REAL_SLIDES[REAL_COUNT - 1]!, id: '__clone_last'},
  ...REAL_SLIDES,
  {...REAL_SLIDES[0]!, id: '__clone_first'},
];

// Index of real first slide in extended list
const EXT_START = 1;

function extIndexToReal(extIndex: number): number {
  if (extIndex === 0) return REAL_COUNT - 1;
  if (extIndex === REAL_COUNT + 1) return 0;
  return extIndex - EXT_START;
}

export default function OnboardingScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const extIndexRef = useRef(EXT_START);
  const isJumpingRef = useRef(false);
  const wrapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    return () => {
      if (wrapTimeoutRef.current != null) {
        clearTimeout(wrapTimeoutRef.current);
      }
    };
  }, []);

  const scrollToExt = useCallback((extIndex: number, animated: boolean): void => {
    flatListRef.current?.scrollToOffset({
      offset: extIndex * SCREEN_WIDTH,
      animated,
    });
  }, []);

  const jumpToReal = useCallback((realIndex: number): void => {
    const extIndex = realIndex + EXT_START;
    isJumpingRef.current = true;
    scrollToExt(extIndex, false);
    extIndexRef.current = extIndex;
    isJumpingRef.current = false;
  }, [scrollToExt]);

  const completeOnboarding = useCallback((): void => {
    navigation.replace('Home');
  }, [navigation]);

  const handleNext = useCallback((): void => {
    const nextExt = extIndexRef.current + 1;
    const isForwardWrap = nextExt === REAL_COUNT + 1;
    const realIndex = extIndexToReal(nextExt);

    scrollToExt(nextExt, true);
    extIndexRef.current = nextExt;
    setCurrentIndex(realIndex);

    if (isForwardWrap) {
      wrapTimeoutRef.current = setTimeout(() => jumpToReal(0), WRAP_JUMP_DELAY_MS);
    }
  }, [scrollToExt, jumpToReal]);

  const handleBack = useCallback((): void => {
    const prevExt = extIndexRef.current - 1;
    const isBackWrap = prevExt === 0;
    const realIndex = extIndexToReal(prevExt);

    scrollToExt(prevExt, true);
    extIndexRef.current = prevExt;
    setCurrentIndex(realIndex);

    if (isBackWrap) {
      wrapTimeoutRef.current = setTimeout(() => jumpToReal(REAL_COUNT - 1), WRAP_JUMP_DELAY_MS);
    }
  }, [scrollToExt, jumpToReal]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
      if (isJumpingRef.current) return;
      const offset = event.nativeEvent.contentOffset.x;
      const extIndex = Math.round(offset / SCREEN_WIDTH);
      extIndexRef.current = extIndex;
      setCurrentIndex(extIndexToReal(extIndex));

      if (extIndex === 0) {
        jumpToReal(REAL_COUNT - 1);
      } else if (extIndex === REAL_COUNT + 1) {
        jumpToReal(0);
      }
    },
    [jumpToReal],
  );

  const currentSlide = REAL_SLIDES[currentIndex] ?? REAL_SLIDES[0]!;
  const currentTextColor = currentSlide.textColor;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <FlatList
        ref={flatListRef}
        data={EXTENDED_SLIDES}
        keyExtractor={item => item.id}
        renderItem={({item}) => <OnboardingSlideItem slide={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        initialScrollIndex={EXT_START}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_data, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Footer overlay — absolut di atas slide */}
      <View style={[styles.footer, {paddingBottom: insets.bottom + spacing.lg}]}>
        <View style={styles.navGroup}>
          <TouchableOpacity
            style={[styles.navButton, {backgroundColor: currentTextColor}]}
            onPress={handleBack}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke slide sebelumnya">
            <Icon icon={AltArrowLeft} size={24} color={colors.neutral[0]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, {backgroundColor: currentTextColor}]}
            onPress={handleNext}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Lanjut ke slide berikutnya">
            <Icon icon={AltArrowRight} size={24} color={colors.neutral[0]} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.skipButton, {backgroundColor: currentTextColor}]}
          onPress={completeOnboarding}
          activeOpacity={0.7}
          hitSlop={{top: spacing.md, bottom: spacing.md, left: spacing.sm, right: spacing.sm}}
          accessibilityRole="button"
          accessibilityLabel="Lewati onboarding">
          <Text style={styles.skipText}>SKIP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  navGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  skipButton: {
    minHeight: 32,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  skipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    letterSpacing: 1,
    color: colors.neutral[0],
  },
});
