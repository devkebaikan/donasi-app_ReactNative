import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Video from 'react-native-video';
import {colors, spacing, radius} from '@/theme';
import {useSplashNavigation} from '@/hooks/useSplashNavigation';

const {width, height} = Dimensions.get('window');

// Di emulator/development, video decoder berukuran besar (10MB+) sering memicu ion/gralloc memory crash.
// Kita sediakan fallback ke video ringan jika tersedia, atau logo statis jika video gagal/dinonaktifkan.
const VIDEO_SOURCE: React.ComponentProps<typeof Video>['source'] | null =
  require('../../assets/images/loading_splash/loading_splash2.mp4');

const COUNTDOWN_START = 3;

// Onboarding wajib tampil setiap kali aplikasi dibuka — splash selalu
// menjalankan alur "first launch" (video/countdown → Onboarding).
export default function SplashScreen(): React.JSX.Element {
  const {navigateToOnboarding} = useSplashNavigation();
  const insets = useSafeAreaInsets();
  const hasNavigated = useRef(false);
  const [videoFailed, setVideoFailed] = useState(!VIDEO_SOURCE);
  const [isPlaying, setIsPlaying] = useState(true);
  const [countdown, setCountdown] = useState(COUNTDOWN_START);

  const safeNavigateToOnboarding = useCallback((): void => {
    if (hasNavigated.current) {
      return;
    }
    hasNavigated.current = true;
    setIsPlaying(false);
    navigateToOnboarding();
  }, [navigateToOnboarding]);

  // Tick murni — tidak ada side effect navigasi di dalam updater setState,
  // supaya tidak memicu "setState while rendering a different component".
  useEffect(() => {
    if (countdown <= 0) {
      return;
    }
    const timeout = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [countdown]);

  // Navigasi dipicu sebagai effect terpisah saat countdown mencapai 0.
  useEffect(() => {
    if (countdown === 0) {
      safeNavigateToOnboarding();
    }
  }, [countdown, safeNavigateToOnboarding]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {VIDEO_SOURCE && !videoFailed && isPlaying ? (
        <Video
          source={VIDEO_SOURCE}
          style={styles.video}
          resizeMode="cover"
          muted
          paused={!isPlaying}
          onEnd={safeNavigateToOnboarding}
          onError={() => setVideoFailed(true)}
        />
      ) : (
        <View style={styles.fallbackContainer}>
          <Image
            source={require('../../assets/images/logo/logo-long-white.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, {top: insets.top + spacing.lg}]}
        onPress={safeNavigateToOnboarding}
        accessibilityRole="button"
        accessibilityLabel={`Lanjutkan, ${countdown} detik`}>
        <Text style={styles.buttonText}>Lanjutkan {countdown}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#009688',
  },
  video: {
    position: 'absolute',
    width,
    height,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logo: {
    width: width * 0.65,
    height: 80,
  },
  button: {
    position: 'absolute',
    right: spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.neutral[0],
    fontSize: 12,
    fontWeight: '400',
  },
});
