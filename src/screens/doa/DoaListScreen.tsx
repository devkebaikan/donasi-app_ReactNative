import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {HandHeart} from '@solar-icons/react-native/Linear';
import {PenNewSquare} from '@solar-icons/react-native/Bold';
import {Notes} from '@solar-icons/react-native/Linear';
import {Star} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {FloatingOrbs} from '@/components/shared/FloatingOrbs';
import {DoaBannerCarousel} from '@/components/shared/DoaBannerCarousel';
import {DoaTabBar} from '@/components/shared/DoaTabBar';
import {DoaCard} from '@/components/shared/DoaCard';
import {DoaCardSkeleton} from '@/components/shared/DoaCardSkeleton';
import {QuranConfirmDialog} from '@/components/shared/QuranConfirmDialog';
import {EmptyState} from '@/components/ui/EmptyState';
import {Button} from '@/components/ui/Button';
import {SafeAreaFooter} from '@/components/ui/SafeAreaFooter';
import {useDoaList} from '@/hooks/useDoaList';
import {useAuthStore} from '@/stores/authStore';
import {
  colors,
  spacing,
  radius,
  shadows,
  fontSize,
  fontWeight,
  lineHeight,
} from '@/theme';
import type {RootStackNavigationProp, RootStackParamList} from '@/types/navigation';
import type {Doa, DoaTab} from '@/types/doa';

// Tiga cukup untuk mengisi layar terkecil yang didukung tanpa perlu diukur.
const SKELETON_KEYS = ['a', 'b', 'c'];

const EMPTY_STATE: Record<DoaTab, {title: string; description: string}> = {
  all: {
    title: 'Belum ada doa',
    description: 'Jadilah yang pertama menuliskan doa.',
  },
  mine: {
    title: 'Belum ada doa yang kamu tulis',
    description: 'Doa yang kamu kirim akan tampil di sini.',
  },
  favorite: {
    title: 'Belum ada doa favorit',
    description: 'Tekan ikon bintang di doa yang ingin kamu simpan.',
  },
};

const EMPTY_STATE_ICON = {
  all: HandHeart,
  mine: Notes,
  favorite: Star,
};

export default function DoaListScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'DoaList'>>();
  const isAuthenticated = useAuthStore(s => s.accessToken != null);
  const listRef = useRef<FlatList<Doa>>(null);

  const {
    activeTab,
    banners,
    doaList,
    isLoading,
    isListLoading,
    isLoadingMore,
    isRefreshing,
    isReporting,
    changeTab,
    toggleAmiin,
    toggleFavorite,
    report,
    loadMore,
    refresh,
  } = useDoaList(isAuthenticated, route.params?.initialTab ?? 'all');

  // Murni state tampilan: wajar hilang saat data di-refresh, jadi tidak perlu
  // naik ke hook atau store.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [reportTarget, setReportTarget] = useState<Doa | null>(null);

  // `initialTab` hanya jadi nilai awal useState di hook, dan screen ini TIDAK
  // di-mount ulang saat DoaCreate memanggil popTo — instance yang sama dipakai
  // lagi. Jadi perpindahan tab setelah kirim doa harus dijalankan dari sini.
  // Param dikosongkan setelah dipakai supaya kiriman berikutnya (yang nilainya
  // sama-sama 'mine') tetap memicu efek ini.
  const initialTabParam = route.params?.initialTab;
  useEffect(() => {
    if (!initialTabParam) {
      return;
    }
    changeTab(initialTabParam);
    listRef.current?.scrollToOffset({offset: 0, animated: false});
    navigation.setParams({initialTab: undefined});
  }, [initialTabParam, changeTab, navigation]);

  const isTabLocked = activeTab !== 'all' && !isAuthenticated;

  function handleBack(): void {
    navigation.goBack();
  }

  function goToLogin(): void {
    navigation.navigate('Login', {
      redirectTo: {screen: 'DoaList', params: undefined},
    });
  }

  function handlePressRegister(): void {
    navigation.navigate('Register');
  }

  function handleChangeTab(tab: DoaTab): void {
    if (tab === activeTab) {
      return;
    }
    changeTab(tab);
    listRef.current?.scrollToOffset({offset: 0, animated: false});
  }

  function handleToggleExpand(doaId: string): void {
    setExpandedIds(current => new Set(current).add(doaId));
  }

  function handlePressAmiin(doa: Doa): void {
    if (!isAuthenticated) {
      goToLogin();
      return;
    }
    toggleAmiin(doa);
  }

  function handlePressFavorite(doa: Doa): void {
    if (!isAuthenticated) {
      goToLogin();
      return;
    }
    toggleFavorite(doa);
  }

  function handlePressReport(doa: Doa): void {
    if (!isAuthenticated) {
      goToLogin();
      return;
    }
    setReportTarget(doa);
  }

  async function handleConfirmReport(): Promise<void> {
    if (!reportTarget) {
      return;
    }
    const target = reportTarget;
    setReportTarget(null);
    await report(target);
  }

  // Guest diarahkan ke Login dengan tujuan DoaCreate — supaya setelah berhasil
  // masuk langsung mendarat di form tulis doa, bukan balik ke daftar.
  function handlePressCreate(): void {
    if (!isAuthenticated) {
      navigation.navigate('Login', {
        redirectTo: {screen: 'DoaCreate', params: undefined},
      });
      return;
    }
    navigation.navigate('DoaCreate');
  }

  function renderAuthGate(): React.JSX.Element {
    return (
      <View style={styles.authGateWrapper}>
        <LinearGradient
          colors={[colors.primary[200], colors.primary[50], colors.neutral[0]]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.authGateGradient}
        />
        <FloatingOrbs />
        <View style={styles.authGateCard}>
          <View style={styles.authGateIconWrapper}>
            <Icon icon={HandHeart} size={40} color={colors.primary[500]} />
          </View>
          <Text style={styles.authGateTitle}>Masuk untuk Menulis Doa</Text>
          <Text style={styles.authGateSubtitle}>
            Masuk untuk menyimpan doa favorit dan melihat doa yang pernah kamu
            tulis.
          </Text>
          <View style={styles.authGateButtonWrapper}>
            <Button label="Masuk Sekarang" onPress={goToLogin} />
          </View>
          <TouchableOpacity
            onPress={handlePressRegister}
            accessibilityRole="button"
            accessibilityLabel="Belum punya akun? Daftar">
            <Text style={styles.authGateRegisterText}>
              Belum punya akun?{' '}
              <Text style={styles.authGateRegisterLink}>Daftar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderSkeletonList(): React.JSX.Element {
    return (
      <View style={styles.skeletonList}>
        {SKELETON_KEYS.map(key => (
          <DoaCardSkeleton key={key} />
        ))}
      </View>
    );
  }

  // Banner dan tab bar ikut ter-scroll bersama feed — hanya HeaderLight yang
  // menempel di atas. Karena itu keduanya jadi isi ListHeaderComponent, bukan
  // sibling FlatList.
  function renderListHeader(): React.JSX.Element {
    return (
      <View>
        <DoaBannerCarousel banners={banners} onPress={handlePressCreate} />
        <DoaTabBar activeTab={activeTab} onChange={handleChangeTab} />

        {/* Daftar lama sengaja tidak dikosongkan saat tab berganti
            (keepPreviousData di useDoaList) — indikator ini yang memberi tahu
            bahwa isi tab baru sedang dimuat, bukan layar kosong berkedip. */}
        {isListLoading ? (
          <ActivityIndicator
            style={styles.listLoading}
            color={colors.primary[500]}
          />
        ) : null}
      </View>
    );
  }

  // Satu FlatList untuk semua kondisi — auth gate dan skeleton pun lewat
  // ListEmptyComponent, supaya tab bar di header tetap ikut terender dan guest
  // masih bisa balik ke tab "Semua Doa".
  function renderListEmpty(): React.JSX.Element | null {
    if (isTabLocked) {
      return renderAuthGate();
    }
    if (isLoading) {
      return renderSkeletonList();
    }
    if (isListLoading) {
      return null;
    }
    return renderEmptyState();
  }

  function renderEmptyState(): React.JSX.Element {
    const copy = EMPTY_STATE[activeTab];
    return (
      <EmptyState
        icon={EMPTY_STATE_ICON[activeTab]}
        title={copy.title}
        description={copy.description}
      />
    );
  }

  return (
    <View style={styles.container}>
      <HeaderLight title="Relung Doa" onBack={handleBack} />

      <FlatList
        ref={listRef}
        data={isTabLocked ? [] : doaList}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          isTabLocked || doaList.length === 0 ? styles.listContentEmpty : null,
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
          <View style={styles.cardWrapper}>
            <DoaCard
              doa={item}
              isExpanded={expandedIds.has(item.id)}
              onToggleExpand={handleToggleExpand}
              onPressAmiin={handlePressAmiin}
              onPressFavorite={handlePressFavorite}
              onPressReport={handlePressReport}
            />
          </View>
        )}
        ListHeaderComponent={renderListHeader()}
        ListEmptyComponent={renderListEmpty()}
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator
              style={styles.footerLoading}
              color={colors.primary[500]}
            />
          ) : null
        }
      />

      {/* Auth gate sudah punya CTA "Masuk Sekarang" sendiri, dan keduanya
          menuju Login — footer disembunyikan supaya tidak ada dua tombol yang
          melakukan hal yang sama. */}
      {isTabLocked ? null : (
        <SafeAreaFooter>
          <Button
            label="Tulis Doa"
            icon={PenNewSquare}
            onPress={handlePressCreate}
          />
        </SafeAreaFooter>
      )}

      <QuranConfirmDialog
        visible={reportTarget != null}
        title="Laporkan doa ini?"
        description="Doa yang dilaporkan akan ditinjau tim kami."
        confirmLabel="Laporkan"
        isLoading={isReporting}
        onConfirm={handleConfirmReport}
        onCancel={() => setReportTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  listContent: {
    // Tanpa padding horizontal: band carousel di ListHeaderComponent harus
    // full-bleed. Padding kartu dipindah ke cardWrapper.
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  cardWrapper: {
    paddingHorizontal: spacing.lg,
  },
  skeletonList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
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
  authGateWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  authGateGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  authGateCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: radius['2xl'],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
    gap: spacing.md,
    ...shadows.sm,
  },
  authGateIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  authGateTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  authGateSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  authGateButtonWrapper: {
    alignSelf: 'stretch',
    marginTop: spacing.xs,
  },
  authGateRegisterText: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  authGateRegisterLink: {
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
});
