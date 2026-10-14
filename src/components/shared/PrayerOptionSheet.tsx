import React, {useCallback, useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {CheckCircle} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {colors, fontWeight, fontSize, radius, spacing} from '@/theme';

export interface PrayerSheetOption<T extends string | number> {
  value: T;
  label: string;
  description: string | null;
}

interface PrayerOptionSheetProps<T extends string | number> {
  title: string;
  isOpen: boolean;
  options: PrayerSheetOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

// Satu sheet untuk semua baris yang bentuknya sama: daftar pilihan dengan satu
// yang aktif — metode, mazhab, lintang tinggi, imsak, hijriah, dan muadzin.
export function PrayerOptionSheet<T extends string | number>({
  title,
  isOpen,
  options,
  selectedValue,
  onSelect,
  onClose,
}: PrayerOptionSheetProps<T>): React.JSX.Element {
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
      snapPoints={['60%']}
      enableDynamicSizing={false}
      onDismiss={handleDismissed}
      backdropComponent={renderBackdrop}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {options.map(option => {
          const isSelected = option.value === selectedValue;
          return (
            <TouchableOpacity
              key={String(option.value)}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onSelect(option.value)}
              accessibilityRole="radio"
              accessibilityState={{selected: isSelected}}
              accessibilityLabel={option.label}>
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                {option.description ? (
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                ) : null}
              </View>
              {isSelected ? (
                <Icon
                  icon={CheckCircle}
                  size={22}
                  color={colors.primary[600]}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </BottomSheetScrollView>
    </BottomSheetModal>
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
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  optionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    color: colors.neutral[900],
  },
  optionDescription: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
});
