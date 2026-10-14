import React, {forwardRef, useCallback} from 'react';
import {Text, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {QuranQariSelector} from '@/components/shared/QuranQariSelector';
import {colors, spacing, fontSize, fontWeight} from '@/theme';
import type {Qari} from '@/types/quran';

interface QuranQariSheetProps {
  value: Qari;
  onSelect: (qari: Qari) => void;
}

// Pemilih qari yang bisa dibuka langsung dari halaman baca, tanpa keluar ke
// Pengaturan. Pilihannya store yang sama, jadi apa pun yang dipilih di sini
// juga berlaku di Pengaturan dan sebaliknya.
export const QuranQariSheet = forwardRef<BottomSheetModal, QuranQariSheetProps>(
  function QuranQariSheetComponent({value, onSelect}, ref): React.JSX.Element {
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
        enableDynamicSizing
        backdropComponent={renderBackdrop}>
        <BottomSheetScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Pilih Qari</Text>
          <Text style={styles.subtitle}>
            Berlaku untuk murottal per ayat maupun satu surah penuh.
          </Text>

          <QuranQariSelector value={value} onChange={onSelect} />
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.neutral[500],
  },
});
