import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';
import {colors, fontWeight, fontSize, radius, spacing} from '@/theme';

export interface ActionSheetAction {
  value: string;
  label: string;
  icon: SolarIconComponent;
  /** 'danger' untuk aksi merusak — tampil dengan garis dan teks merah. */
  tone?: 'default' | 'danger';
}

interface ActionSheetProps {
  isOpen: boolean;
  title: string;
  actions: ActionSheetAction[];
  onSelect: (value: string) => void;
  onClose: () => void;
}

// Tinggi dihitung dari jumlah aksi: judul + n baris. Dipatok eksplisit karena
// dynamic sizing di gorhom 5.2 + reanimated 4 bisa gagal mengukur dan membuat
// sheet ter-present tanpa pernah naik ke layar.
const BASE_PERCENT = 18;
const PERCENT_PER_ACTION = 11;
const MAX_PERCENT = 72;

// Sheet daftar aksi untuk seluruh app — dulu bernama DonasiBersamaActionSheet,
// padahal isinya sudah generik sejak awal (judul + daftar aksi + tone danger).
// Namanya diluruskan saat menu Donasi Rutin jadi pemakai kelima.
//
// Struktur sheet (ref, backdrop, present/dismiss lewat prop isOpen) mengikuti
// AmalanActionSheet. PrayerOptionSheet tidak dipakai karena ini daftar AKSI
// tanpa nilai terpilih — memakainya memaksa mengoper selectedValue="" yang
// tidak berarti apa-apa, dan sheet itu juga tidak punya icon per baris.
export function ActionSheet({
  isOpen,
  title,
  actions,
  onSelect,
  onClose,
}: ActionSheetProps): React.JSX.Element {
  const sheetRef = useRef<BottomSheetModal>(null);
  // Menahan dismiss() sebelum sheet pernah present — lihat catatan panjang di
  // PrayerOptionSheet soal status INITIAL di gorhom 5.2.
  const hasPresentedRef = useRef(false);

  const snapPoints = useMemo(
    () => [
      `${Math.min(BASE_PERCENT + actions.length * PERCENT_PER_ACTION, MAX_PERCENT)}%`,
    ],
    [actions.length],
  );

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
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      onDismiss={handleDismissed}
      backdropComponent={renderBackdrop}>
      <BottomSheetView style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {actions.map(action => {
          const isDanger = action.tone === 'danger';
          return (
            <TouchableOpacity
              key={action.value}
              style={[styles.action, isDanger && styles.actionDanger]}
              onPress={() => onSelect(action.value)}
              accessibilityRole="button"
              accessibilityLabel={action.label}>
              <Icon
                icon={action.icon}
                size={20}
                color={
                  isDanger ? colors.semantic.error : colors.neutral[700]
                }
              />
              <Text
                style={[styles.actionLabel, isDanger && styles.actionLabelDanger]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    fontSize: fontSize.md,
    color: colors.neutral[900],
    paddingBottom: spacing.xs,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  // Latar putih dengan garis merah pucat — `errorLight` (#FEE2E2) adalah
  // tingkat 100 pada palet danger di @/theme. Nada merahnya cukup dibawa
  // garis, icon, dan teks; latar penuh membuat satu baris menu berteriak
  // lebih keras dari isi layarnya.
  actionDanger: {
    borderColor: colors.semantic.errorLight,
    backgroundColor: colors.neutral[0],
  },
  actionLabel: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    color: colors.neutral[900],
  },
  actionLabelDanger: {
    color: colors.semantic.error,
  },
});
