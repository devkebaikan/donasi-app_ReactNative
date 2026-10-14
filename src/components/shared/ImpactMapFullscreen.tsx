import React, {useEffect} from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CloseCircle} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {ImpactMapCanvas} from '@/components/shared/ImpactMapCanvas';
import {ImpactMapLegend} from '@/components/shared/ImpactMapLegend';
import {colors, spacing, fontSize, fontWeight} from '@/theme';
import type {ImpactProvinceShape} from '@/types/impact';

interface ImpactMapFullscreenProps {
  isOpen: boolean;
  shapes: ImpactProvinceShape[];
  onClose: () => void;
}

// Di bawah 1x peta jadi lebih kecil dari layar tanpa guna; di atas 6x geometri
// yang sudah disederhanakan mulai terlihat bersudut.
const MIN_SCALE = 1;
const MAX_SCALE = 6;

function clampScale(value: number): number {
  'worklet';
  return Math.min(Math.max(value, MIN_SCALE), MAX_SCALE);
}

// Peta layar penuh. Zoom TIDAK ditaruh di peta dalam halaman karena peta di
// sana hidup di dalam ScrollView vertikal dan gesture-nya akan berebut dengan
// gulir halaman. Modal memiliki seluruh layar, jadi tidak ada yang direbut.
export function ImpactMapFullscreen({
  isOpen,
  shapes,
  onClose,
}: ImpactMapFullscreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Direset tiap kali dibuka, bukan diingat: membuka peta dan mendapati
  // posisinya tertinggal dari sesi sebelumnya lebih membingungkan daripada
  // membantu.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [
    isOpen,
    scale,
    savedScale,
    translateX,
    translateY,
    savedTranslateX,
    savedTranslateY,
  ]);

  const pinch = Gesture.Pinch()
    .onUpdate(event => {
      scale.value = clampScale(savedScale.value * event.scale);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const pan = Gesture.Pan()
    .onUpdate(event => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withTiming(1);
      savedScale.value = 1;
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    });

  // Pinch dan pan berjalan bersamaan; ketuk dua kali menang lebih dulu supaya
  // tidak ikut ditafsirkan sebagai awal pan.
  const gesture = Gesture.Exclusive(doubleTap, Gesture.Simultaneous(pinch, pan));

  const mapStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
      {scale: scale.value},
    ],
  }));

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      {/* react-native-gesture-handler tidak menembus batas Modal bawaan RN —
          tanpa root view sendiri di sini, pinch dan pan diam saja. */}
      <GestureHandlerRootView style={styles.root}>
        <View style={[styles.header, {paddingTop: insets.top + spacing.sm}]}>
          <Text style={styles.title}>Peta Sebaran Manfaat</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Tutup peta layar penuh">
            <Icon icon={CloseCircle} size={28} color={colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        <GestureDetector gesture={gesture}>
          <View style={styles.canvasArea}>
            <Animated.View style={mapStyle}>
              {/* Tanpa onSelectProvince: di layar penuh angkanya sudah
                  terbaca langsung, dan menumpuk bottom sheet di atas modal
                  membuat dua lapis yang sama-sama bisa ditutup. */}
              <ImpactMapCanvas shapes={shapes} />
            </Animated.View>
          </View>
        </GestureDetector>

        <View style={[styles.footer, {paddingBottom: insets.bottom + spacing.md}]}>
          <ImpactMapLegend />
          <Text style={styles.hint}>
            Cubit untuk memperbesar, ketuk dua kali untuk mengembalikan
          </Text>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  canvasArea: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});
