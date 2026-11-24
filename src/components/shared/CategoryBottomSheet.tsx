import React, {forwardRef, useCallback} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CategorySelectedBadge} from '@/components/shared/CategorySelectedBadge';
import {sanitizeImageUrl} from '@/utils/imageUrl';
import type {Category} from '@/types/category';

interface CategoryBottomSheetProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (category: Category) => void;
}

const SHEET_BACKGROUND_STYLE = {backgroundColor: '#FFFFFF', borderRadius: 24};
const HANDLE_INDICATOR_STYLE = {backgroundColor: '#D1D5DB', width: 44};

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
      backgroundStyle={SHEET_BACKGROUND_STYLE}
      handleIndicatorStyle={HANDLE_INDICATOR_STYLE}>
      <View className="flex-1 px-5">
        {/* Header */}
        <View className="flex-row items-center justify-between pb-3 border-b border-neutral-100">
          <View className='flex-col gap-0'>
          <Text className="text-base font-semibold text-neutral-900">
            Kategori Program
          </Text>
          <Text className="text-xs text-neutral-400">
            Pilih kategori program yang ingin anda tampilkan
          </Text>
          </View>
          <TouchableOpacity
            testID="category-sheet-close-button"
            className="w-8 h-8 rounded-full items-center justify-center bg-neutral-100"
            onPress={handleClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Tutup">
            <Text className="text-sm font-semibold text-neutral-500">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Grid ScrollView */}
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex-row flex-wrap pt-4"
          contentContainerStyle={{paddingBottom: insets.bottom + 24}}>
          {categories.map(category => {
            const isSelected = category.id === selectedCategoryId;
            return (
              <TouchableOpacity
                key={category.id}
                testID={`category-sheet-item-${category.id}`}
                className="w-1/4 items-center gap-1.5 mb-5"
                onPress={() => onSelectCategory(category)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={category.name}
                accessibilityState={{selected: isSelected}}>
                <View
                  className={`relative w-14 h-14 rounded-full items-center justify-center ${
                    isSelected
                      ? 'bg-primary-50 border-2 border-primary-500'
                      : 'bg-primary-50/70 border border-transparent'
                  }`}>
                  <Image
                    source={{uri: sanitizeImageUrl(category.image_url)}}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                  {isSelected && <CategorySelectedBadge />}
                </View>
                <Text
                  className={`text-xs text-center px-1 ${
                    isSelected
                      ? 'font-semibold text-primary-600'
                      : 'font-medium text-neutral-500'
                  }`}
                  numberOfLines={1}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
});
