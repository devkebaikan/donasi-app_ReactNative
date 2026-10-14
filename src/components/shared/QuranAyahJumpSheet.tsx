import React, {forwardRef, useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import {screenWidth} from '@/utils/screen';

const COLUMN_COUNT = 5;
const GRID_GAP = spacing.sm;
// Lebar sel dihitung dari lebar layar, bukan angka tetap — dengan lebar tetap
// selalu ada sisa ruang di kanan yang bikin petaknya terlihat tidak rata.
const CELL_SIZE =
  (screenWidth -
    spacing.lg * 2 -
    GRID_GAP * (COLUMN_COUNT - 1)) /
  COLUMN_COUNT;

interface QuranAyahJumpSheetProps {
  surahName: string;
  totalAyah: number;
  activeAyah: number;
  onSelect: (ayahNumber: number) => void;
}

// Petak nomor ayat untuk lompat cepat. Angkanya latin, bukan arab: ini alat
// navigasi yang dipindai sekilas, dan 286 angka arab jauh lebih lambat
// ditemukan mata daripada angka latin.
export const QuranAyahJumpSheet = forwardRef<
  BottomSheetModal,
  QuranAyahJumpSheetProps
>(function QuranAyahJumpSheetComponent(
  {surahName, totalAyah, activeAyah, onSelect},
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

  const ayahNumbers = Array.from({length: totalAyah}, (_, i) => i + 1);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={['60%']}
      backdropComponent={renderBackdrop}>
      <BottomSheetScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Pergi ke ayat</Text>
        <Text style={styles.subtitle}>
          {surahName} · {totalAyah} ayat
        </Text>

        <View style={styles.grid}>
          {ayahNumbers.map(number => {
            const isActive = number === activeAyah;
            return (
              <TouchableOpacity
                key={number}
                style={[styles.cell, isActive && styles.cellActive]}
                onPress={() => onSelect(number)}
                accessibilityRole="button"
                accessibilityLabel={`Ayat ${number}`}
                accessibilityState={{selected: isActive}}>
                <Text
                  style={[styles.cellLabel, isActive && styles.cellLabelActive]}>
                  {number}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

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
    marginBottom: spacing.lg,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.neutral[500],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
  },
  cellActive: {
    backgroundColor: colors.primary[500],
  },
  cellLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  cellLabelActive: {
    color: colors.neutral[0],
    fontWeight: fontWeight.bold,
  },
});
