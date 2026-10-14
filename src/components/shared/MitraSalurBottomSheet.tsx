import React, {forwardRef, useCallback} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {MitraSalur, MitraSalurRole} from '@/types/programDetail';

interface MitraSalurBottomSheetProps {
  mitraList: MitraSalur[];
  onSelectMitra: (mitra: MitraSalur) => void;
}

const ROLE_LABEL: Record<MitraSalurRole, string> = {
  utama: 'Mitra Utama',
  bantuan: 'Mitra Bantuan',
};

export const MitraSalurBottomSheet = forwardRef<
  BottomSheetModal,
  MitraSalurBottomSheetProps
>(function MitraSalurBottomSheetComponent(
  {mitraList, onSelectMitra},
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

  function handleClose(): void {
    if (typeof ref === 'function' || !ref?.current) {
      return;
    }
    ref.current.dismiss();
  }

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={['50%']}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}>
      <BottomSheetView
        style={[styles.container, {paddingBottom: insets.bottom + spacing.md}]}>
        <View style={styles.header}>
          <Text style={styles.title}>Mitra Salur</Text>
          <TouchableOpacity
            testID="mitra-salur-sheet-close-button"
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Tutup">
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
        {mitraList.map(mitra => (
          <TouchableOpacity
            key={mitra.id}
            testID={`mitra-salur-sheet-item-${mitra.id}`}
            style={styles.item}
            onPress={() => onSelectMitra(mitra)}
            accessibilityRole="button"
            accessibilityLabel={`${mitra.name}, ${ROLE_LABEL[mitra.role]}`}>
            <Image
              source={{uri: mitra.photoUrl}}
              style={styles.logo}
              resizeMode="cover"
              accessibilityRole="image"
              accessibilityLabel={`Logo ${mitra.name}`}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {mitra.name}
              </Text>
              <Text style={styles.itemRole}>{ROLE_LABEL[mitra.role]}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.neutral[0],
  },
  handleIndicator: {
    backgroundColor: colors.neutral[300],
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: fontSize.lg,
    color: colors.neutral[500],
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    paddingVertical: spacing.sm,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  itemRole: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
});
