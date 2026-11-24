import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {ArrowLeft, Magnifer, CloseCircle} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {CategoryPillList} from '@/components/shared/CategoryPillList';
import {CategoryBottomSheet} from '@/components/shared/CategoryBottomSheet';
import {FeaturedDonationsSection} from '@/components/shared/FeaturedDonationsSection';
import {DonationFilterDropdown} from '@/components/shared/DonationFilterDropdown';
import {DonationSortDirectionToggle} from '@/components/shared/DonationSortDirectionToggle';
import {DonationListToggle} from '@/components/shared/DonationListToggle';
import {DonationListCard} from '@/components/shared/DonationListCard';
import {DonationListCardSkeleton} from '@/components/shared/DonationListCardSkeleton';
import {useAllDonations} from '@/hooks/useAllDonations';
import {colors} from '@/theme';
import type {RootStackNavigationProp} from '@/types/navigation';
import type {Program} from '@/types/program';
import type {Category} from '@/types/category';

interface AllDonationsScreenProps {
  route: {
    params?: {
      search?: string;
      categoryId?: number;
    };
  };
}

export default function AllDonationsScreen({
  route,
}: AllDonationsScreenProps): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const insets = useSafeAreaInsets();
  const categorySheetRef = useRef<BottomSheetModal>(null);

  const [searchInput, setSearchInput] = useState(route.params?.search || '');
  const [searchQuery, setSearchQuery] = useState(route.params?.search || '');

  // Debounce input pencarian otomatis saat mengetik
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const {
    categories,
    selectedCategoryId,
    featuredPrograms,
    sortOption,
    sortDirection,
    viewMode,
    donations,
    isLoading,
    isRefreshing,
    isListLoading,
    isLoadingMore,
    selectCategory,
    setSortOption,
    toggleSortDirection,
    setViewMode,
    loadMore,
    refresh,
  } = useAllDonations(searchQuery, route.params?.categoryId ?? null);

  function handleBack(): void {
    navigation.goBack();
  }

  function handleSubmitSearch(): void {
    setSearchQuery(searchInput.trim());
  }

  function handleClearSearch(): void {
    setSearchInput('');
    setSearchQuery('');
  }

  function handleProgramPress(program: Program): void {
    navigation.navigate('DetailProgram', {link: program.link || String(program.id)});
  }

  function handlePressMoreCategories(): void {
    categorySheetRef.current?.present();
  }

  function handleSelectCategory(category: Category | null): void {
    if (!category) {
      if (selectedCategoryId !== null) {
        const currentCategory = categories.find(c => c.id === selectedCategoryId);
        if (currentCategory) {
          selectCategory(currentCategory);
        }
      }
      return;
    }
    selectCategory(category);
  }

  function handleSelectCategoryFromSheet(category: Category): void {
    selectCategory(category);
    categorySheetRef.current?.dismiss();
  }

  return (
    <View className="flex-1 bg-white" style={{paddingTop: insets.top}}>
      {/* Header Search Sticky */}
      <View className="flex-row items-center px-4 py-2.5 border-b border-neutral-100 gap-3 bg-white">
        <TouchableOpacity
          className="min-h-[44px] min-w-[44px] items-center justify-center -ml-2"
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={ArrowLeft} size={24} color={colors.neutral[800]} />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center bg-neutral-100/90 rounded-full px-3.5 py-2 gap-2">
          <Icon icon={Magnifer} size={18} color={colors.neutral[400]} />
          <TextInput
            className="flex-1 text-xs text-neutral-900 p-0"
            placeholder="Cari program donasi.."
            placeholderTextColor={colors.neutral[400]}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSubmitSearch}
            returnKeyType="search"
          />
          {searchInput ? (
            <TouchableOpacity
              onPress={handleClearSearch}
              accessibilityRole="button"
              accessibilityLabel="Hapus pencarian">
              <Icon icon={CloseCircle} size={18} color={colors.neutral[400]} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Quick Category Filter Pills */}
      <View className="border-b border-neutral-100 bg-white">
        <CategoryPillList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
          onPressMore={handlePressMoreCategories}
          visibleCount={3}
        />
      </View>

      {isLoading ? (
        <View className="flex-1 px-4 py-4 gap-3">
          <DonationListCardSkeleton />
          <DonationListCardSkeleton />
          <DonationListCardSkeleton />
        </View>
      ) : (
        <FlatList
          testID="donation-list"
          key={viewMode}
          data={isListLoading ? [] : donations}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={viewMode === 'grid' ? 2 : 1}
          columnWrapperStyle={viewMode === 'grid' ? {gap: 12, paddingHorizontal: 16} : undefined}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-3 pb-8"
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.primary[500]}
              colors={[colors.primary[500]]}
            />
          }
          ListHeaderComponent={
            <>
              {/* Program Pilihan (Horizontal Scroll) */}
              {/* {featuredPrograms.length > 0 && (
                <>
                  <FeaturedDonationsSection
                    programs={featuredPrograms}
                    onPressProgram={handleProgramPress}
                  />
                  <View className="h-2 bg-neutral-100 my-1" />
                </>
              )} */}

              {/* Toolbar Sort & View Mode */}
              <View className="px-4 pt-3 pb-1">
                {/* Controls Row */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <DonationFilterDropdown
                      value={sortOption}
                      onChange={setSortOption}
                    />
                    <DonationSortDirectionToggle
                      value={sortDirection}
                      onPress={toggleSortDirection}
                    />
                  </View>
                  <DonationListToggle value={viewMode} onChange={setViewMode} />
                </View>
              </View>
            </>
          }
          renderItem={({item}) => (
            <View className={viewMode === 'grid' ? 'flex-1 mb-2' : 'px-4'}>
              <DonationListCard
                program={item}
                variant={viewMode}
                onPress={handleProgramPress}
              />
            </View>
          )}
          ListEmptyComponent={
            isListLoading ? (
              <View className="px-4 py-2 gap-3" testID="donation-list-loading">
                <DonationListCardSkeleton />
                <DonationListCardSkeleton />
                <DonationListCardSkeleton />
              </View>
            ) : (
              <View className="items-center justify-center py-16 gap-3" testID="donation-list-empty">
                <View className="w-20 h-20 rounded-full bg-neutral-100 items-center justify-center">
                  <Text className="text-4xl">📭</Text>
                </View>
                <Text className="text-sm font-medium text-neutral-500">Program tidak tersedia</Text>
              </View>
            )
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator color={colors.primary[500]} />
              </View>
            ) : null
          }
        />
      )}

      {/* Category Bottom Sheet Modal */}
      <CategoryBottomSheet
        ref={categorySheetRef}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategoryFromSheet}
      />
    </View>
  );
}
