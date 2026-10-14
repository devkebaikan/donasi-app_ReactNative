import React from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {DocumentText} from '@solar-icons/react-native/Linear';
import {NewsHeader} from '@/components/shared/NewsHeader';
import {NewsFeaturedSection} from '@/components/shared/NewsFeaturedSection';
import {NewsListCard} from '@/components/shared/NewsListCard';
import {NotifFilterChip} from '@/components/shared/NotifFilterChip';
import {EmptyState} from '@/components/ui/EmptyState';
import {useNews} from '@/hooks/useNews';
import {colors, spacing} from '@/theme';
import type {RootStackNavigationProp} from '@/types/navigation';
import type {Article, NewsFilter} from '@/types/news';

const FILTERS: {value: NewsFilter; label: string}[] = [
  {value: 'recommended', label: 'Rekomendasi'},
  {value: 'popular', label: 'Terpopuler'},
  {value: 'newest', label: 'Terbaru'},
];

export default function NewsScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {
    featuredArticles,
    activeFilter,
    isSearchActive,
    searchInput,
    searchQuery,
    articles,
    isLoading,
    isListLoading,
    isLoadingMore,
    isRefreshing,
    changeFilter,
    openSearch,
    setSearchInput,
    submitSearch,
    clearSearch,
    loadMore,
    refresh,
  } = useNews();

  function handlePressArticle(article: Article): void {
    navigation.navigate('NewsDetail', {articleId: article.id});
  }

  return (
    <View style={styles.container}>
      <NewsHeader
        title="Berita"
        onBack={() => navigation.goBack()}
        isSearchActive={isSearchActive}
        searchInput={searchInput}
        onChangeSearchInput={setSearchInput}
        onPressSearchToggle={openSearch}
        onSubmitSearch={submitSearch}
        onPressClear={clearSearch}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : (
        <FlatList
          data={isListLoading ? [] : articles}
          keyExtractor={item => item.id}
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
              <NewsFeaturedSection
                articles={featuredArticles}
                onPressArticle={handlePressArticle}
              />
              <View style={styles.filterRow}>
                {FILTERS.map(filter => (
                  <NotifFilterChip
                    key={filter.value}
                    label={filter.label}
                    active={activeFilter === filter.value}
                    onPress={() => changeFilter(filter.value)}
                  />
                ))}
              </View>
            </>
          }
          renderItem={({item}) => (
            <View style={styles.cardWrapper}>
              <NewsListCard article={item} onPress={handlePressArticle} />
            </View>
          )}
          ListEmptyComponent={
            isListLoading ? (
              <View style={styles.listLoading}>
                <ActivityIndicator color={colors.primary[500]} />
              </View>
            ) : (
              <EmptyState
                icon={DocumentText}
                title={
                  searchQuery ? 'Berita tidak ditemukan' : 'Belum ada berita tersedia'
                }
              />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing['3xl'],
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  cardWrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  listLoading: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
