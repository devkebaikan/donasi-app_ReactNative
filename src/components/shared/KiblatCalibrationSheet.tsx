import React, {useCallback, useEffect, useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {colors, fontWeight, fontSize, radius, spacing} from '@/theme';

interface KiblatCalibrationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS: string[] = [
  'Pegang perangkat dengan mantap, lalu gerakkan membentuk angka 8 beberapa kali.',
  'Jauhkan dari benda logam, speaker, dan casing bermagnet.',
  'Letakkan perangkat mendatar saat membaca arah kiblat.',
];

// Kalibrasi tidak bisa dipicu dari kode — yang bisa dilakukan aplikasi hanya
// memberi tahu caranya. Karena itu isinya panduan, bukan tombol proses.
export function KiblatCalibrationSheet({
  isOpen,
  onClose,
}: KiblatCalibrationSheetProps): React.JSX.Element {
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      onDismiss={onClose}
      backdropComponent={renderBackdrop}>
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Mengkalibrasi Kompas</Text>

        {STEPS.map((step, index) => (
          <View key={step} style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  title: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
    color: colors.neutral[900],
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
  },
  stepNumberText: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
    color: colors.primary[700],
  },
  stepText: {
    flex: 1,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    color: colors.neutral[700],
  },
});
