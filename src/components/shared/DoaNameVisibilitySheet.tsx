import React, {forwardRef, useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CheckCircle} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight, lineHeight} from '@/theme';
import type {DoaNameVisibility} from '@/types/doa';

interface DoaNameVisibilitySheetProps {
  // Nama pengguna yang sedang login — jadi label opsi 'name'.
  userName: string;
  selectedValue: DoaNameVisibility | null;
  onSelect: (value: DoaNameVisibility) => void;
}

// Sheet ini dibuka lewat ref (`ref.current?.present()`), bukan lewat prop
// `isOpen` — pola yang sama dengan ShareBottomSheet dan QuranSurahPickerSheet.
// PrayerOptionSheet yang memakai prop `isOpen` + useEffect tidak pernah muncul
// di screen ini, termasuk saat isOpen di-hardcode true.
export const DoaNameVisibilitySheet = forwardRef<
  BottomSheetModal,
  DoaNameVisibilitySheetProps
>(function DoaNameVisibilitySheetComponent(
  {userName, selectedValue, onSelect},
  ref,
): React.JSX.Element {
  const insets = useSafeAreaInsets();

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

  const options: {
    value: DoaNameVisibility;
    label: string;
    description: string;
  }[] = [
    {
      value: 'name',
      label: userName,
      description: 'Nama kamu ditampilkan di doa ini',
    },
    {
      value: 'anonymous',
      label: 'Hamba Allah',
      description: 'Doa dikirim tanpa menampilkan nama kamu',
    },
  ];

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={['40%']}
      backdropComponent={renderBackdrop}>
      <BottomSheetView
        style={[styles.container, {paddingBottom: insets.bottom + spacing.xl}]}>
        <Text style={styles.title}>Tampilkan Nama</Text>

        {options.map(option => {
          const isSelected = option.value === selectedValue;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onSelect(option.value)}
              accessibilityRole="radio"
              accessibilityState={{selected: isSelected}}
              accessibilityLabel={`${option.label}. ${option.description}`}>
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>
              {isSelected ? (
                <Icon
                  icon={CheckCircle}
                  size={22}
                  color={colors.secondary[500]}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: 44,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.lg,
  },
  optionSelected: {
    borderColor: colors.secondary[500],
    backgroundColor: colors.secondary[50],
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  optionDescription: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[500],
  },
});
