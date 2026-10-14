import React, {useCallback, useEffect, useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {formatNumberWithSeparator} from '@/utils/formatCurrency';
import {
  IMPACT_MARKER_COLOR,
  IMPACT_MARKER_LABEL,
} from '@/screens/impact/impactColors';
import {colors, spacing, fontWeight, fontSize} from '@/theme';
import type {ImpactMarkerKind, ImpactProvince} from '@/types/impact';

interface ImpactProvinceListSheetProps {
  isOpen: boolean;
  provinces: ImpactProvince[];
  onClose: () => void;
}

// Jalur baca yang setara untuk data di peta: teks di dalam <Svg> tidak terbaca
// screen reader dengan enak, dan angka penanda sengaja kecil.
//
// Dibuat sebagai bottom sheet, BUKAN accordion di dalam halaman: isinya 30-an
// provinsi kali tiga angka, dan membentangkannya di tengah halaman yang juga
// memuat peta, asnaf, dan footer tetap membuat daftarnya sulit dijangkau.
// Sheet memberi daftar ini area gulir sendiri.
export function ImpactProvinceListSheet({
  isOpen,
  provinces,
  onClose,
}: ImpactProvinceListSheetProps): React.JSX.Element {
  const sheetRef = useRef<BottomSheetModal>(null);
  // Menahan dismiss() sebelum sheet pernah present — lihat catatan panjang di
  // PrayerOptionSheet, perilaku gorhom 5.2 yang sama berlaku di sini.
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
      snapPoints={SNAP_POINTS}
      // Tinggi dipatok, tidak dinamis: isinya panjang dan harus bisa digulir
      // di dalam sheet, bukan memanjangkan sheet-nya.
      enableDynamicSizing={false}
      onDismiss={handleDismissed}
      backdropComponent={renderBackdrop}>
      <View style={styles.header}>
        <Text style={styles.title}>Rincian per Provinsi</Text>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {provinces.length === 0 ? (
          <Text style={styles.empty}>Belum ada data provinsi.</Text>
        ) : (
          provinces.map(province => (
            <View key={province.code} style={styles.row}>
              <Text style={styles.provinceName}>{province.name}</Text>
              <View style={styles.stats}>
                <StatLine
                  kind="participant"
                  value={province.participantCount}
                />
                <StatLine kind="village" value={province.villageCount} />
                <StatLine kind="bummas" value={province.bummasCount} />
              </View>
            </View>
          ))
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const SNAP_POINTS = ['85%'];

function StatLine({
  kind,
  value,
}: {
  kind: ImpactMarkerKind;
  value: number;
}): React.JSX.Element {
  return (
    <View style={styles.statRow}>
      <View style={[styles.dot, dotStyles[kind]]} />
      <Text style={styles.statLabel}>{IMPACT_MARKER_LABEL[kind]}</Text>
      {/* Angka UTUH di sini — versi ringkas hanya dipakai di penanda peta. */}
      <Text style={styles.statValue}>{formatNumberWithSeparator(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
    color: colors.neutral[900],
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  empty: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  row: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  provinceName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[800],
  },
  stats: {
    gap: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statLabel: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.neutral[600],
  },
  statValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
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
