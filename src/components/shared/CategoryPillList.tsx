import React from 'react';
import {ScrollView, TouchableOpacity, Text, Image, View} from 'react-native';
import {Widget} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {sanitizeImageUrl} from '@/utils/imageUrl';
import {colors} from '@/theme';
import type {Category} from '@/types/category';

interface CategoryPillListProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (category: Category | null) => void;
  onPressMore: () => void;
  visibleCount?: number;
}

export function CategoryPillList({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onPressMore,
  visibleCount = 4,
}: CategoryPillListProps): React.JSX.Element {
  const visibleCategories = categories.slice(0, visibleCount);
  const isSelectedInMore =
    selectedCategoryId !== null &&
    !visibleCategories.some(c => c.id === selectedCategoryId);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-row items-center px-4 py-2.5 gap-2"
      className="bg-white">
      {/* Pill Semua */}
      <TouchableOpacity
        testID="category-pill-all"
        onPress={() => onSelectCategory(null)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Semua Kategori"
        accessibilityState={{selected: selectedCategoryId === null}}
        className={`flex-row items-center px-3.5 py-1.5 rounded-full ${
          selectedCategoryId === null
            ? 'bg-primary-500'
            : 'bg-neutral-100'
        }`}>
        <Text
          className={`text-xs ${
            selectedCategoryId === null
              ? 'text-white font-semibold'
              : 'text-neutral-700 font-medium'
          }`}>
          Semua
        </Text>
      </TouchableOpacity>

      {/* Quick Visible Categories */}
      {visibleCategories.map(item => {
        const isSelected = item.id === selectedCategoryId;
        const imageUrl = sanitizeImageUrl(item.image_url);

        return (
          <TouchableOpacity
            key={item.id}
            testID={`category-pill-${item.id}`}
            onPress={() => onSelectCategory(isSelected ? null : item)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            accessibilityState={{selected: isSelected}}
            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${
              isSelected
                ? 'bg-primary-500'
                : 'bg-neutral-100'
            }`}>
            {imageUrl ? (
              <Image
                source={{uri: imageUrl}}
                className="w-4 h-4 rounded-full"
                resizeMode="cover"
              />
            ) : null}
            <Text
              className={`text-xs ${
                isSelected
                  ? 'text-white font-semibold'
                  : 'text-neutral-700 font-medium'
              }`}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Button Lainnya */}
      <TouchableOpacity
        testID="category-pill-more"
        onPress={onPressMore}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Lihat kategori lainnya"
        accessibilityState={{selected: isSelectedInMore}}
        className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${
          isSelectedInMore
            ? 'bg-primary-500'
            : 'bg-neutral-100'
        }`}>
        <Icon
          icon={Widget}
          size={14}
          color={isSelectedInMore ? '#FFFFFF' : colors.neutral[600]}
        />
        <Text
          className={`text-xs ${
            isSelectedInMore
              ? 'text-white font-semibold'
              : 'text-neutral-700 font-medium'
          }`}>
          Lainnya
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

