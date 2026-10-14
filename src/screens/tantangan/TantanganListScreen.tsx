import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {Notebook} from '@solar-icons/react-native/Linear';
import {AddCircle, Flag2} from '@solar-icons/react-native/Bold';
import {NewsHeader} from '@/components/shared/NewsHeader';
import {FloatingOrbs} from '@/components/shared/FloatingOrbs';
import {TantanganTabBar} from '@/components/shared/TantanganTabBar';
import {TantanganCard} from '@/components/shared/TantanganCard';
import {TantanganCardSkeleton} from '@/components/shared/TantanganCardSkeleton';
import {Button} from '@/components/ui/Button';
import {EmptyState} from '@/components/ui/EmptyState';
import {Icon} from '@/components/ui/Icon';
import {SafeAreaFooter} from '@/components/ui/SafeAreaFooter';
import {useTantanganList} from '@/hooks/useTantanganList';
import {useAuthStore} from '@/stores/authStore';
import {colors, spacing, fontSize, fontWeight, lineHeight} from '@/theme';
import type {RootStackNavigationProp} from '@/types/navigation';
import type {Tantangan} from '@/types/tantangan';

// Cukup untuk memenuhi layar terkecil yang didukung tanpa perlu diukur.
const SKELETON_KEYS = ['a', 'b', 'c'];

export default function TantanganListScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const isAuthenticated = useAuthStore(s => s.accessToken != null);
  const {
    activeTab,
    isSearchActive,
    searchInput,
    searchQuery,
    challenges,
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
  } = useTantanganList();

  function handleBack(): void {
    navigation.goBack();
  }

  // Satu-satunya pintu ke Jurnal Kebaikan selain tombol "Catat Hari Ini" di
  // detail. Isinya data pribadi, jadi guest diarahkan ke Login dulu.
  function handleOpenJurnal(): void {
    if (!isAuthenticated) {
      navigation.navigate('Login', {
        redirectTo: {screen: 'TantanganJurnal', params: undefined},
      });
      return;
    }
    navigation.navigate('TantanganJurnal');
  }

  function handleOpenDetail(challenge: Tantangan): void {
    navigation.navigate('TantanganDetail', {challengeId: challenge.id});
  }

  // Guest dikembalikan ke daftar setelah login, bukan langsung ke form:
  // TantanganCreate sengaja tidak masuk LoginRedirectTarget karena membuat
  // tantangan bukan aksi yang layak diteruskan otomatis setelah login.
  function handlePressCreate(): void {
    if (!isAuthenticated) {
      navigation.navigate('Login', {
        redirectTo: {screen: 'TantanganList', params: undefined},
      });
      return;
    }
    navigation.navigate('TantanganCreate');
  }

  function renderEmptyState(): React.JSX.Element {
    if (searchQuery) {
      return (
        <EmptyState
          icon={Flag2}
          title="Tantangan Tidak Ditemukan"
          description={`Tidak ada tantangan yang cocok dengan "${searchQuery}".`}
        />
      );
    }
    if (activeTab === 'ending') {
      return (
        <EmptyState
          icon={Flag2}
          title="Tidak Ada yang Segera Berakhir"
          description="Semua tantangan masih punya waktu panjang."
        />
      );
    }
    return (
      <EmptyState
        icon={Flag2}
        title="Belum Ada Tantangan"
        description="Tantangan baru akan muncul di sini."
      />
    );
  }

  // Judul, subjudul, dan tab semuanya hidup DI DALAM blok banner, jadi
  // gradient dan orb-nya membentang di belakang ketiganya. Seluruh blok ini
  // ListHeaderComponent, jadi ikut menggulir; yang menempel di atas cuma navbar
  // berikut field pencariannya. overflow: 'hidden' di heroBlock yang membatasi
  // FloatingOrbs (tingginya 999) — tanpa itu orb menembus ke celah antar kartu.
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
          <Text style={styles.heroTitle}>Tantangan Untukmu</Text>
          <Text style={styles.heroSubtitle}>
            Ikut tantangan, jalani bersama, tumbuh dalam kebaikan.
          </Text>
        </View>

        <View style={styles.tabWrapper}>
          <TantanganTabBar activeTab={activeTab} onChange={setActiveTab} />
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
        title="Tantangan Amal"
        onBack={handleBack}
        isSearchActive={isSearchActive}
        searchInput={searchInput}
        onChangeSearchInput={setSearchInput}
        onPressSearchToggle={openSearch}
        onSubmitSearch={submitSearch}
        onPressClear={clearSearch}
        placeholder="Cari tantangan..."
        rightSlot={
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleOpenJurnal}
            accessibilityRole="button"
            accessibilityLabel="Jurnal Kebaikan">
            <Icon icon={Notebook} size={22} color={colors.neutral[900]} />
          </TouchableOpacity>
        }
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
              <TantanganCardSkeleton />
            </View>
          )}
        />
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            challenges.length === 0 ? styles.listContentEmpty : null,
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
              <TantanganCard challenge={item} onPress={handleOpenDetail} />
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
          kebetulan berada di posisinya, dan kartu di daftar ini lebar-lebar.
          Alasan yang sama sudah ditulis di DonasiBersamaListScreen. */}
      <SafeAreaFooter>
        <Button
          label="Buat Tantangan"
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
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
    // Kartu tantangan cukup tinggi; jarak md (12) membuat batas antar kartu
    // nyaris hilang karena kartunya berlatar neutral[50] di atas putih.
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
