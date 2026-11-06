import React, {forwardRef, useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {sanitizeImageUrl} from '@/utils/imageUrl';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {MenuItem} from '@/components/shared/MenuUtamaGrid';

interface MenuUtamaBottomSheetProps {
  items: MenuItem[];
  onSelectItem: (screen: string) => void;
}

// Isi sheet ini SEMUA menu, bukan cuma yang tidak muat di grid — sama seperti
// CategoryBottomSheet yang menampilkan seluruh kategori, bukan sisanya saja.
// Bentuk dan ukurannya sengaja disalin dari sheet kategori itu.
export const MenuUtamaBottomSheet = forwardRef<
  BottomSheetModal,
  MenuUtamaBottomSheetProps
>(function MenuUtamaBottomSheetComponent(
  {items, onSelectItem},
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
      snapPoints={['60%']}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}>
      <BottomSheetView
        style={[styles.container, {paddingBottom: insets.bottom + spacing.lg}]}>
        <View style={styles.header}>
          <Text style={styles.title}>Semua Menu</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Tutup">
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.grid}>
          {items.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.item}
              onPress={() => onSelectItem(item.screen)}
              accessibilityRole="button"
              accessibilityLabel={item.name}>
              <View style={styles.iconWrapper}>
                <Image
                  source={{uri: sanitizeImageUrl(item.image_url)}}
                  style={styles.itemImage}
                  resizeMode="contain"
                />
                {item.is_new ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>NEW</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.label} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const COLUMN_COUNT = 4;

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
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    width: `${100 / COLUMN_COUNT}%`,
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: 30,
    height: 30,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.secondary[500],
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.neutral[0],
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
});
