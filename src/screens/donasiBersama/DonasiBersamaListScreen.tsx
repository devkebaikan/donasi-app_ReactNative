import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {UsersGroupTwoRounded} from '@solar-icons/react-native/Linear';
import {AddCircle} from '@solar-icons/react-native/Bold';
import {NewsHeader} from '@/components/shared/NewsHeader';
import {FloatingOrbs} from '@/components/shared/FloatingOrbs';
import {DonasiBersamaTabBar} from '@/components/shared/DonasiBersamaTabBar';
import {DonasiBersamaGroupCard} from '@/components/shared/DonasiBersamaGroupCard';
import {DonasiBersamaGroupCardSkeleton} from '@/components/shared/DonasiBersamaGroupCardSkeleton';
import {EmptyState} from '@/components/ui/EmptyState';
import {Button} from '@/components/ui/Button';
import {SafeAreaFooter} from '@/components/ui/SafeAreaFooter';
import {useDonasiBersamaList} from '@/hooks/useDonasiBersamaList';
import {useAuthStore} from '@/stores/authStore';
import {colors, spacing, fontSize, fontWeight, lineHeight} from '@/theme';
import type {RootStackNavigationProp} from '@/types/navigation';
import type {DonasiBersamaGroup} from '@/types/donasiBersama';

// Cukup untuk memenuhi layar terkecil yang didukung tanpa perlu diukur.
const SKELETON_KEYS = ['a', 'b', 'c'];

export default function DonasiBersamaListScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const isAuthenticated = useAuthStore(s => s.accessToken != null);
  const {
    activeTab,
    isSearchActive,
    searchInput,
    searchQuery,
    groups,
    isLoading,
    isListLoading,
    isLoadingMore,
    isRefreshing,
    setActiveTab,
    openSearch,
    setSearchInput,
    submitSearch,
    clearSearch,
    loadMore,
    refresh,
  } = useDonasiBersamaList();

  function handleBack(): void {
    navigation.goBack();
  }

  function handleOpenDetail(group: DonasiBersamaGroup): void {
    navigation.navigate('DonasiBersamaDetail', {groupId: group.id});
  }

  function handlePressCreate(): void {
    if (!isAuthenticated) {
      navigation.navigate('Login', {
        redirectTo: {screen: 'DonasiBersamaCreate', params: undefined},
      });
      return;
    }
    navigation.navigate('DonasiBersamaCreate');
  }

  function renderEmptyState(): React.JSX.Element {
    if (searchQuery) {
      return (
        <EmptyState
          icon={UsersGroupTwoRounded}
          title="Grup Tidak Ditemukan"
          description={`Tidak ada grup yang cocok dengan "${searchQuery}".`}
        />
      );
    }
    if (activeTab === 'ending') {
      return (
        <EmptyState
          icon={UsersGroupTwoRounded}
          title="Tidak Ada yang Segera Berakhir"
          description="Semua grup masih punya waktu panjang."
        />
      );
    }
    return (
      <EmptyState
        icon={UsersGroupTwoRounded}
        title="Belum Ada Grup"
        description="Jadilah yang pertama membuat grup donasi."
      />
    );
  }

  // Gradient, orb, hero, dan tab semuanya hidup DI DALAM header daftar supaya
  // ikut menggulir. Yang menempel di atas cuma navbar. Blok ini juga yang
  // membatasi FloatingOrbs (tingginya 999) lewat overflow: 'hidden' — tanpa itu
  // orb menembus ke celah antar kartu.
  function renderListHeader(): React.JSX.Element {
    return (
      <View style={styles.heroBlock}>
        <LinearGradient
          colors={[colors.primary[200], colors.primary[50], colors.neutral[0]]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroGradient}
        />
        <FloatingOrbs />

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Komunitas Kebaikan</Text>
          <Text style={styles.heroSubtitle}>
            Bikin grup, tentukan target bersama, dan urun kebaikan sampai
            tercapai.
          </Text>
        </View>

        <View style={styles.tabWrapper}>
          <DonasiBersamaTabBar activeTab={activeTab} onChange={setActiveTab} />
        </View>

        {/* Daftar lama sengaja tidak dikosongkan saat tab atau kata kunci
            berganti (keepPreviousData di hook) — indikator ini yang memberi
            tahu bahwa hasil baru sedang dimuat, bukan layar kosong berkedip. */}
        {isListLoading ? (
          <ActivityIndicator
            style={styles.listLoading}
            color={colors.primary[500]}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NewsHeader
        title="Donasi Bersama"
        onBack={handleBack}
        isSearchActive={isSearchActive}
        searchInput={searchInput}
        onChangeSearchInput={setSearchInput}
        onPressSearchToggle={openSearch}
        onSubmitSearch={submitSearch}
        onPressClear={clearSearch}
        placeholder="Cari grup..."
      />

      {isLoading ? (
        <FlatList
          data={SKELETON_KEYS}
          keyExtractor={item => item}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderListHeader()}
          renderItem={() => (
            <View style={styles.itemWrapper}>
              <DonasiBersamaGroupCardSkeleton />
            </View>
          )}
        />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            groups.length === 0 ? styles.listContentEmpty : null,
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
            <View style={styles.itemWrapper}>
              <DonasiBersamaGroupCard group={item} onPress={handleOpenDetail} />
            </View>
          )}
          ListHeaderComponent={renderListHeader()}
          ListEmptyComponent={
            isListLoading ? null : (
              <View style={styles.itemWrapper}>{renderEmptyState()}</View>
            )
          }
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

      {/* Tombol tetap di bawah, bukan FAB melayang: FAB menutupi kartu yang
          kebetulan berada di posisinya, dan daftar ini kartunya lebar. */}
      <SafeAreaFooter>
        <Button
          label="Buat Grup"
          icon={AddCircle}
          onPress={handlePressCreate}
        />
      </SafeAreaFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  // overflow: 'hidden' yang membatasi FloatingOrbs supaya tidak menembus
  // ke area kartu di bawahnya.
  heroBlock: {
    overflow: 'hidden',
    paddingBottom: spacing.xs,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  heroTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[800],
    lineHeight: fontSize['2xl'] * lineHeight.tight,
  },
  heroSubtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  tabWrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  listContent: {
    // Tanpa padding horizontal supaya blok hero + gradient bisa penuh selebar
    // layar; jarak tepi kartu diatur itemWrapper.
    paddingTop: 0,
    paddingBottom: spacing.lg,
    // Kartu grup cukup tinggi; jarak md (12) membuat batas antar kartu nyaris
    // hilang karena kartunya berlatar neutral[50] di atas putih.
    gap: spacing.lg,
  },
  itemWrapper: {
    paddingHorizontal: spacing.lg,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  listLoading: {
    paddingBottom: spacing.md,
  },
  footerLoading: {
    paddingTop: spacing.md,
  },
});
