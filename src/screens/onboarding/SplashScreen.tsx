import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Video from 'react-native-video';
import {colors, spacing, radius} from '@/theme';
import {useSplashNavigation} from '@/hooks/useSplashNavigation';

const {width, height} = Dimensions.get('window');

const VIDEO_SOURCE: React.ComponentProps<typeof Video>['source'] | null =
  require('../../assets/videos/splash.mp4');

const COUNTDOWN_START = 5;

// Onboarding wajib tampil setiap kali aplikasi dibuka — splash selalu
// menjalankan alur "first launch" (video/countdown → Onboarding).
export default function SplashScreen(): React.JSX.Element {
  const {navigateToOnboarding} = useSplashNavigation();
  const insets = useSafeAreaInsets();
  const hasNavigated = useRef(false);
  const [videoFailed, setVideoFailed] = useState(!VIDEO_SOURCE);
  const [countdown, setCountdown] = useState(COUNTDOWN_START);

  const safeNavigateToOnboarding = useCallback((): void => {
    if (hasNavigated.current) {
      return;
    }
    hasNavigated.current = true;
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

      {VIDEO_SOURCE && !videoFailed && (
        <Video
          source={VIDEO_SOURCE}
          style={styles.video}
          resizeMode="cover"
          muted
          paused={false}
          onEnd={safeNavigateToOnboarding}
          onError={() => setVideoFailed(true)}
        />
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
