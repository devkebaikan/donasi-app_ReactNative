import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {Widget} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {CategorySelectedBadge} from '@/components/shared/CategorySelectedBadge';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {Category} from '@/types/category';

interface DonationCategoryGridProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (category: Category) => void;
  onPressMore: () => void;
}

const VISIBLE_COUNT = 4;

export function DonationCategoryGrid({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onPressMore,
}: DonationCategoryGridProps): React.JSX.Element {
  const visibleCategories = categories.slice(0, VISIBLE_COUNT);
  const isSelectedInMore =
    selectedCategoryId !== null &&
    !visibleCategories.some(category => category.id === selectedCategoryId);

  return (
    <View style={styles.container}>
      {visibleCategories.map(category => {
        const isSelected = category.id === selectedCategoryId;
        return (
          <TouchableOpacity
            key={category.id}
            testID={`donation-category-item-${category.id}`}
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

      <TouchableOpacity
        testID="donation-category-more-tile"
        style={styles.item}
        onPress={onPressMore}
        accessibilityRole="button"
        accessibilityLabel="Lihat semua kategori">
        <View
          style={[
            styles.iconWrapper,
            isSelectedInMore && styles.iconWrapperSelected,
          ]}>
          <Icon icon={Widget} size={26} color={colors.primary[600]} />
          {isSelectedInMore && <CategorySelectedBadge />}
        </View>
        <Text style={styles.label} numberOfLines={1}>
          Lainnya
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperSelected: {
    backgroundColor: colors.neutral[100],
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
