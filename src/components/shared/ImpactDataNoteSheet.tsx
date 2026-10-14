import React, {useCallback, useEffect, useRef} from 'react';
import {Text, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {colors, spacing, fontWeight, fontSize, lineHeight} from '@/theme';

interface ImpactDataNoteSheetProps {
  isOpen: boolean;
  note: string;
  onClose: () => void;
}

// Berisi penjelasan istilah "Desa Berdaya" dan "BUMMas" plus atribusi sumber
// peta. Teksnya datang dari API supaya bisa diperbarui tanpa rilis baru.
export function ImpactDataNoteSheet({
  isOpen,
  note,
  onClose,
}: ImpactDataNoteSheetProps): React.JSX.Element {
  const sheetRef = useRef<BottomSheetModal>(null);
  const hasPresentedRef = useRef(false);

  const handleDismissed = useCallback(() => {
    hasPresentedRef.current = false;
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      hasPresentedRef.current = true;
      sheetRef.current?.present();
      return;
    }
    if (hasPresentedRef.current) {
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
      onDismiss={handleDismissed}
      backdropComponent={renderBackdrop}>
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>Tentang Data Ini</Text>
        <Text style={styles.body}>{note}</Text>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing['2xl'],
    gap: spacing.sm,
  },
  title: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
    color: colors.neutral[900],
  },
  body: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.relaxed * fontSize.sm,
    color: colors.neutral[700],
  },
});
