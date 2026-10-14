import React, {useCallback, useEffect, useRef} from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {Pen, TrashBinTrash} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, fontWeight, fontSize, radius, spacing} from '@/theme';

// Dua aksi + judul; cukup pendek, tidak perlu setinggi sheet pilihan.
const SNAP_POINTS = ['30%'];

interface AmalanActionSheetProps {
  isOpen: boolean;
  amalanTitle: string;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

// Struktur sheet (ref, backdrop, present/dismiss lewat prop isOpen) disalin dari
// PrayerOptionSheet. Sheet itu sendiri tidak dipakai langsung karena ini daftar
// aksi tanpa nilai terpilih, bukan pemilih opsi.
export function AmalanActionSheet({
  isOpen,
  amalanTitle,
  onEdit,
  onDelete,
  onClose,
}: AmalanActionSheetProps): React.JSX.Element {
  const sheetRef = useRef<BottomSheetModal>(null);
  // Dipakai untuk menahan dismiss() sebelum sheet pernah present. Di gorhom
  // 5.2, handleDismiss TIDAK meng-early-exit saat status masih INITIAL: ia
  // mengunci status jadi DISMISSING, dan handlePortalRender menolak merender
  // sheet apa pun selama status itu. Akibatnya present() berikutnya tidak
  // pernah muncul di layar. (handlePortalOnUnmount menjaga INITIAL, dismiss
  // tidak — lihat node_modules/@gorhom/bottom-sheet/src/components/
  // bottomSheetModal/BottomSheetModal.tsx.)
  const hasPresentedRef = useRef(false);

  // Setelah sheet benar-benar tertutup, gorhom memanggil unmount() yang
  // mengembalikan statusnya ke INITIAL. Kalau penanda ini tidak ikut direset,
  // effect di bawah akan memanggil dismiss() sekali lagi pada sheet yang sudah
  // tertutup — dan dismiss() saat INITIAL mengunci status di DISMISSING, jadi
  // sheet tidak akan pernah bisa dibuka untuk kedua kalinya.
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
      // snapPoints eksplisit + enableDynamicSizing={false}, mengikuti pola
      // sheet lain di project ini (PrayerOptionSheet, NominalBottomSheet,
      // MetodePembayaranBottomSheet). Dynamic sizing di gorhom 5.2 +
      // reanimated 4 bisa gagal mengukur tinggi konten, dan sheet-nya
      // ter-present tapi tidak pernah naik ke layar.
      snapPoints={SNAP_POINTS}
      enableDynamicSizing={false}
      onDismiss={handleDismissed}
      backdropComponent={renderBackdrop}>
      <BottomSheetView style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {amalanTitle}
        </Text>

        <TouchableOpacity
          style={styles.action}
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={`Ubah ${amalanTitle}`}>
          <Icon icon={Pen} size={22} color={colors.neutral[700]} />
          <Text style={styles.actionLabel}>Ubah</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={`Hapus ${amalanTitle}`}>
          <Icon icon={TrashBinTrash} size={22} color={colors.semantic.error} />
          <Text style={[styles.actionLabel, styles.actionLabelDanger]}>
            Hapus
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.sm,
  },
  title: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
    color: colors.neutral[900],
    paddingBottom: spacing.sm,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  actionLabel: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
  actionLabelDanger: {
    color: colors.semantic.error,
  },
});
