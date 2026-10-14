import React from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Book} from '@solar-icons/react-native/Linear';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {ReflectionSearchField} from '@/components/shared/ReflectionSearchField';
import {ReflectionCard} from '@/components/shared/ReflectionCard';
import {ReflectionCardSkeleton} from '@/components/shared/ReflectionCardSkeleton';
import {EmptyState} from '@/components/ui/EmptyState';
import {useReflections} from '@/hooks/useReflections';
import {colors, spacing} from '@/theme';
import type {RootStackNavigationProp} from '@/types/navigation';
import type {Reflection} from '@/types/reflection';

// Cukup untuk memenuhi layar terkecil yang didukung tanpa perlu diukur.
const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e', 'f'];

export default function ReflectionListScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {
    searchInput,
    searchQuery,
    reflections,
    isLoading,
    isListLoading,
    isLoadingMore,
    isRefreshing,
    setSearchInput,
    submitSearch,
    clearSearch,
    loadMore,
    refresh,
  } = useReflections();

  function handleBack(): void {
    navigation.goBack();
  }

  function handlePressReflection(reflection: Reflection): void {
    navigation.navigate('RenunganDetail', {reflectionId: reflection.id});
  }

  function renderEmptyState(): React.JSX.Element {
    return searchQuery ? (
      <EmptyState
        icon={Book}
        title="Renungan tidak ditemukan"
        description={`Tidak ada renungan yang cocok dengan "${searchQuery}".`}
      />
    ) : (
      <EmptyState
        icon={Book}
        title="Belum ada renungan"
        description="Renungan baru akan muncul di sini."
      />
    );
  }

  return (
    <View style={styles.container}>
      <HeaderLight title="Renungan" onBack={handleBack} />

      <ReflectionSearchField
        value={searchInput}
        onChangeText={setSearchInput}
        onSubmit={submitSearch}
        onClear={clearSearch}
      />

      {isLoading ? (
        <FlatList
          data={SKELETON_KEYS}
          keyExtractor={item => item}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.listContent}
          renderItem={() => <ReflectionCardSkeleton />}
        />
      ) : (
        <FlatList
          data={reflections}
          keyExtractor={item => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.column}
          contentContainerStyle={[
            styles.listContent,
            reflections.length === 0 ? styles.listContentEmpty : null,
          ]}
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
          renderItem={({item}) => (
            <ReflectionCard reflection={item} onPress={handlePressReflection} />
          )}
          // Daftar lama sengaja tidak dikosongkan saat kata kunci berganti
          // (keepPreviousData di useReflections) — indikator ini yang memberi
          // tahu bahwa hasil baru sedang dimuat, bukan layar kosong berkedip.
          ListHeaderComponent={
            isListLoading ? (
              <ActivityIndicator
                style={styles.listLoading}
                color={colors.primary[500]}
              />
            ) : null
          }
          ListEmptyComponent={isListLoading ? null : renderEmptyState()}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator
                style={styles.footerLoading}
                color={colors.primary[500]}
              />
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
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  column: {
    gap: spacing.sm,
  },
  listLoading: {
    paddingBottom: spacing.md,
  },
  footerLoading: {
    paddingTop: spacing.md,
  },
});
