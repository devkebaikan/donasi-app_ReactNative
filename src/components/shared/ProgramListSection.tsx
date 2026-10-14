import React, {useRef} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {ProgramCard} from '@/components/shared/ProgramCard';
import {Button} from '@/components/ui/Button';
import {DonationCategoryGrid} from '@/components/shared/DonationCategoryGrid';
import {CategoryBottomSheet} from '@/components/shared/CategoryBottomSheet';
import {colors, spacing, fontSize, fontWeight} from '@/theme';
import {screenWidth} from '@/utils/screen';
import type {Category} from '@/types/category';
import type {Program} from '@/types/program';

interface ProgramListSectionProps {
  programs: Program[];
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  onPressProgram: (program: Program) => void;
  onPressSeeMore: () => void;
}

export function ProgramListSection({
  programs,
  categories,
  selectedCategoryId,
  onSelectCategory,
  onPressProgram,
  onPressSeeMore,
}: ProgramListSectionProps): React.JSX.Element {
  const categorySheetRef = useRef<BottomSheetModal>(null);

  const filteredPrograms = selectedCategoryId
    ? programs.filter(program => String(program.category.id) === String(selectedCategoryId))
    : programs;

  function handleSelectCategory(category: Category): void {
    if (selectedCategoryId === category.id) {
      onSelectCategory(null);
    } else {
      onSelectCategory(category.id);
    }
    categorySheetRef.current?.dismiss();
  }

  function handlePressMore(): void {
    categorySheetRef.current?.present();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bantu Kategori Favorite</Text>

      <View style={styles.categoryGridWrapper}>
        <DonationCategoryGrid
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
          onPressMore={handlePressMore}
        />
      </View>

      <View style={styles.list}>
        {filteredPrograms.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateImagePlaceholder}>
              <Text style={styles.emptyStateImageText}>📭</Text>
            </View>
            <Text style={styles.emptyStateText}>Program tidak tersedia</Text>
          </View>
        ) : (
          filteredPrograms.map(program => (
            <ProgramCard
              key={program.id}
              program={program}
              onPress={onPressProgram}
            />
          ))
        )}
      </View>

      <View style={styles.seeMoreButtonWrapper}>
        <Button
          label="Lihat 352 Program Lainnya"
          onPress={onPressSeeMore}
          variant="ghost"
        />
      </View>

      <CategoryBottomSheet
        ref={categorySheetRef}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
    paddingHorizontal: spacing.lg,
  },
  categoryGridWrapper: {
    paddingHorizontal: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  seeMoreButtonWrapper: {
    marginHorizontal: spacing.lg,
  },
  emptyState: {
    minHeight: 240,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyStateImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateImageText: {
    fontSize: 48,
  },
  emptyStateText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});
