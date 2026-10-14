import React, {forwardRef, useCallback} from 'react';
import {Text, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {colors, spacing, fontSize, fontWeight} from '@/theme';

interface QuranTafsirSheetProps {
  title: string;
  content: string | null;
}

export const QuranTafsirSheet = forwardRef<
  BottomSheetModal,
  QuranTafsirSheetProps
>(function QuranTafsirSheetComponent({title, content}, ref): React.JSX.Element {
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
      snapPoints={['60%']}
      backdropComponent={renderBackdrop}>
      <BottomSheetScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.content}>
          {content ?? 'Tafsir belum tersedia untuk ayat ini.'}
        </Text>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  content: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.neutral[800],
    lineHeight: fontSize.md * 1.6,
  },
});
