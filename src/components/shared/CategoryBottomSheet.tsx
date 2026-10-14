import React, {forwardRef, useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CategorySelectedBadge} from '@/components/shared/CategorySelectedBadge';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {Category} from '@/types/category';

interface CategoryBottomSheetProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (category: Category) => void;
}

export const CategoryBottomSheet = forwardRef<
  BottomSheetModal,
  CategoryBottomSheetProps
>(function CategoryBottomSheetComponent(
  {categories, selectedCategoryId, onSelectCategory},
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
          <Text style={styles.title}>Pilih Kategori</Text>
          <TouchableOpacity
            testID="category-sheet-close-button"
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Tutup">
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.grid}>
          {categories.map(category => {
            const isSelected = category.id === selectedCategoryId;
            return (
              <TouchableOpacity
                key={category.id}
                testID={`category-sheet-item-${category.id}`}
                style={styles.item}
                onPress={() => onSelectCategory(category)}
                accessibilityRole="button"
                accessibilityLabel={category.name}
                accessibilityState={{selected: isSelected}}>
                <View
                  style={[
                    styles.iconWrapper,
                    isSelected && styles.iconWrapperSelected,
                  ]}>
                  <Image
                    source={{uri: category.image_url}}
                    style={styles.categoryImage}
                    resizeMode="contain"
                  />
                  {isSelected && <CategorySelectedBadge />}
                </View>
                <Text style={styles.label} numberOfLines={1}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
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
  iconWrapperSelected: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  categoryImage: {
    width: 26,
    height: 26,
  },
});
