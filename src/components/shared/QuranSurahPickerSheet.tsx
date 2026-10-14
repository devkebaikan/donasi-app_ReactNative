import React, {forwardRef, useCallback} from 'react';
import {Text, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {QuranSurahPickerList} from '@/components/shared/QuranSurahPickerList';
import {colors, spacing, fontSize, fontWeight} from '@/theme';
import type {Surah} from '@/types/quran';

interface QuranSurahPickerSheetProps {
  selectedSurahNumber: number | null;
  onSelect: (surah: Surah) => void;
}

export const QuranSurahPickerSheet = forwardRef<
  BottomSheetModal,
  QuranSurahPickerSheetProps
>(function QuranSurahPickerSheetComponent(
  {selectedSurahNumber, onSelect},
  ref,
): React.JSX.Element {
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
      ref={ref}
      snapPoints={['70%']}
      backdropComponent={renderBackdrop}>
      <BottomSheetScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Pilih Surah</Text>
        <QuranSurahPickerList
          selectedSurahNumber={selectedSurahNumber}
          onSelect={onSelect}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  title: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
});
