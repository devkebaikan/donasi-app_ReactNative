import React, {useCallback, useEffect, useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {formatNumberWithSeparator} from '@/utils/formatCurrency';
import {
  IMPACT_MARKER_COLOR,
  IMPACT_MARKER_KINDS,
  IMPACT_MARKER_LABEL,
} from '@/screens/impact/impactColors';
import {colors, spacing, radius, fontWeight, fontSize} from '@/theme';
import type {ImpactMarkerKind, ImpactProvinceShape} from '@/types/impact';

interface ImpactProvinceSheetProps {
  shape: ImpactProvinceShape | null;
  onClose: () => void;
}

function valueOf(shape: ImpactProvinceShape, kind: ImpactMarkerKind): number {
  if (!shape.stats) {
    return 0;
  }
  if (kind === 'participant') {
    return shape.stats.participantCount;
  }
  if (kind === 'village') {
    return shape.stats.villageCount;
  }
  return shape.stats.bummasCount;
}

// Menggantikan pinch to zoom: angka di peta sengaja kecil, sheet ini yang
// menampilkannya dengan ukuran teks normal. Provinsi tanpa program tetap bisa
// dibuka — isinya tiga angka bernilai nol, bukan layar kosong.
export function ImpactProvinceSheet({
  shape,
  onClose,
}: ImpactProvinceSheetProps): React.JSX.Element {
  const sheetRef = useRef<BottomSheetModal>(null);
  // Menahan dismiss() sebelum sheet pernah present — lihat catatan panjang di
  // PrayerOptionSheet, perilaku gorhom 5.2 yang sama berlaku di sini.
  const hasPresentedRef = useRef(false);

  const handleDismissed = useCallback(() => {
    hasPresentedRef.current = false;
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (shape) {
      hasPresentedRef.current = true;
      sheetRef.current?.present();
      return;
    }
    if (hasPresentedRef.current) {
      sheetRef.current?.dismiss();
    }
  }, [shape]);

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
        <Text style={styles.title}>{shape?.geometry.name ?? ''}</Text>
        {shape && !shape.stats ? (
          <Text style={styles.note}>Belum ada program di provinsi ini.</Text>
        ) : null}
        <View style={styles.rows}>
          {IMPACT_MARKER_KINDS.map(kind => (
            <View key={kind} style={styles.row}>
              <View style={[styles.dot, dotStyles[kind]]} />
              <Text style={styles.label}>{IMPACT_MARKER_LABEL[kind]}</Text>
              <Text style={styles.value}>
                {shape ? formatNumberWithSeparator(valueOf(shape, kind)) : '0'}
              </Text>
            </View>
          ))}
        </View>
      </BottomSheetView>
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
  note: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  rows: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  label: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.neutral[700],
  },
  value: {
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
});

const dotStyles = StyleSheet.create<
  Record<ImpactMarkerKind, {backgroundColor: string}>
>({
  participant: {backgroundColor: IMPACT_MARKER_COLOR.participant},
  village: {backgroundColor: IMPACT_MARKER_COLOR.village},
  bummas: {backgroundColor: IMPACT_MARKER_COLOR.bummas},
});
