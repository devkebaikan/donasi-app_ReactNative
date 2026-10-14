import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {ArrowLeft, Magnifer, CloseCircle} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {DonationCategoryGrid} from '@/components/shared/DonationCategoryGrid';
import {CategoryBottomSheet} from '@/components/shared/CategoryBottomSheet';
import {FeaturedDonationsSection} from '@/components/shared/FeaturedDonationsSection';
import {DonationFilterDropdown} from '@/components/shared/DonationFilterDropdown';
import {DonationSortDirectionToggle} from '@/components/shared/DonationSortDirectionToggle';
import {DonationListToggle} from '@/components/shared/DonationListToggle';
import {DonationListCard} from '@/components/shared/DonationListCard';
import {useAllDonations} from '@/hooks/useAllDonations';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {RootStackNavigationProp} from '@/types/navigation';
import type {Program} from '@/types/program';

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

  // Display field: updates on every keystroke. Only committed to searchQuery
  // (and thus to the actual list fetch) when the user submits.
  const [searchInput, setSearchInput] = useState(route.params?.search || '');
  const [searchQuery, setSearchQuery] = useState(route.params?.search || '');

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

  function handleSelectCategoryFromSheet(
    category: Parameters<typeof selectCategory>[0],
  ): void {
    selectCategory(category);
    categorySheetRef.current?.dismiss();
  }

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={ArrowLeft} size={24} color={colors.neutral[700]} />
        </TouchableOpacity>
        <View style={styles.searchInputWrapper}>
          <Icon icon={Magnifer} size={20} color={colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
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
              <Icon icon={CloseCircle} size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : (
        <FlatList
          testID="donation-list"
          key={viewMode}
          data={isListLoading ? [] : donations}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={viewMode === 'grid' ? 2 : 1}
          columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
              <View style={styles.section}>
                <View style={styles.categoryGridWrapper}>
                  <DonationCategoryGrid
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onSelectCategory={selectCategory}
                    onPressMore={handlePressMoreCategories}
                  />
                </View>
              </View>
              <View style={styles.gap} />
              <View style={styles.section}>
                <FeaturedDonationsSection
                  programs={featuredPrograms}
                  onPressProgram={handleProgramPress}
                />
              </View>
              <View style={styles.gap} />
              <View style={styles.section}>
                <View style={styles.toolbar}>
                  <View style={styles.sortGroup}>
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
            <View
              style={[
                styles.section,
                viewMode === 'grid' ? styles.gridItem : styles.listItemWrapper,
              ]}>
              <DonationListCard
                program={item}
                variant={viewMode}
                onPress={handleProgramPress}
              />
            </View>
          )}
          ListEmptyComponent={
            isListLoading ? (
              <View style={styles.listLoading} testID="donation-list-loading">
                <ActivityIndicator color={colors.primary[500]} />
              </View>
            ) : (
              <View style={styles.emptyState} testID="donation-list-empty">
                <View style={styles.emptyImage} />
                <Text style={styles.emptyText}>Program tidak tersedia</Text>
              </View>
            )
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator color={colors.primary[500]} />
              </View>
            ) : null
          }
        />
      )}

      <CategoryBottomSheet
        ref={categorySheetRef}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategoryFromSheet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    gap: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.neutral[900],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  section: {
    backgroundColor: colors.neutral[0],
  },
  gap: {
    height: spacing.md,
    backgroundColor: colors.neutral[50],
  },
  categoryGridWrapper: {
    paddingHorizontal: spacing.lg,
  },
  listItemWrapper: {
    paddingHorizontal: spacing.lg,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  sortGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  listLoading: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  emptyImage: {
    width: 120,
    height: 120,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
  },
  emptyText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
  },
  gridRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  gridItem: {
    flex: 1,
    marginBottom: spacing.md,
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
