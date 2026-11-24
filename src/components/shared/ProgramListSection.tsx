import React, {useRef} from 'react';
import {View, Text} from 'react-native';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {ProgramCard} from '@/components/shared/ProgramCard';
import {Button} from '@/components/ui/Button';
import {DonationCategoryGrid} from '@/components/shared/DonationCategoryGrid';
import {CategoryBottomSheet} from '@/components/shared/CategoryBottomSheet';
import type {Category} from '@/types/category';
import type {Program} from '@/types/program';

interface ProgramListSectionProps {
  programs: Program[];
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  onPressProgram: (program: Program) => void;
  onPressSeeMore: () => void;
  className?: string;
}

export function ProgramListSection({
  programs,
  categories,
  selectedCategoryId,
  onSelectCategory,
  onPressProgram,
  onPressSeeMore,
  className = '',
}: ProgramListSectionProps): React.JSX.Element {
  const categorySheetRef = useRef<BottomSheetModal>(null);

  const filteredPrograms = selectedCategoryId
    ? programs.filter(program => String(program.category?.id) === String(selectedCategoryId))
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
    <View className={`py-6 gap-3 ${className}`}>
      <Text className="text-base font-semibold text-neutral-900 px-4">
        Bantu Kategori Favorite
      </Text>

      <View className="px-4">
        <DonationCategoryGrid
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
          onPressMore={handlePressMore}
        />
      </View>

      <View className="px-4 gap-2">
        {filteredPrograms.length === 0 ? (
          <View className="min-h-[240px] bg-neutral-50 rounded-xl items-center justify-center py-6 gap-3">
            <View className="w-20 h-20 rounded-full bg-neutral-100 items-center justify-center">
              <Text className="text-5xl">📭</Text>
            </View>
            <Text className="text-base font-medium text-neutral-500 text-center">
              Program tidak tersedia
            </Text>
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

      <View className="mx-4">
        <Button
          label="Program Lainnya"
          onPress={onPressSeeMore}
          size='md'
          // variant="ghost"
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
