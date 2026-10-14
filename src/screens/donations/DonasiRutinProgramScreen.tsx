import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {ArrowLeft, HandHeart} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {FloatingOrbs} from '@/components/shared/FloatingOrbs';
import {SearchField} from '@/components/ui/SearchField';
import {EmptyState} from '@/components/ui/EmptyState';
import {DonationListCard} from '@/components/shared/DonationListCard';
import {DonationListCardSkeleton} from '@/components/shared/DonationListCardSkeleton';
import {DonationFilterDropdown} from '@/components/shared/DonationFilterDropdown';
import {DonationSortDirectionToggle} from '@/components/shared/DonationSortDirectionToggle';
import {useRecurringProgramList} from '@/hooks/useRecurringProgramList';
import {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
} from '@/theme';
import type {DonasiRutinProgramScreenProps} from '@/types/navigation';
import type {Program} from '@/types/program';

const SKELETON_KEYS = ['a', 'b', 'c'];

type ListRow =
  | {kind: 'program'; program: Program}
  | {kind: 'skeleton'; id: string};

// Katalog program yang bisa didonasikan rutin. Dulu ini tab "Pilihan Rutin" di
// RecurringDonationScreen; sekarang berdiri sendiri sebagai kelanjutan dari
// "Pilih Program Sendiri" di DonasiRutinJenisScreen. Isinya dipindah apa
// adanya — hook, kartu, dan kontrol urutannya sama persis.
export default function DonasiRutinProgramScreen({
  navigation,
}: DonasiRutinProgramScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const programList = useRecurringProgramList(searchQuery);

  function handlePressProgram(program: Program): void {
    navigation.navigate('DetailProgram', {
      link: program.link || String(program.id),
    });
  }

  function buildRows(): ListRow[] {
    if (programList.isLoading) {
      return SKELETON_KEYS.map(id => ({kind: 'skeleton', id}));
    }
    return programList.programs.map(program => ({kind: 'program', program}));
  }

  function renderRow({item}: {item: ListRow}): React.JSX.Element {
    return (
      <View style={styles.itemWrapper}>
        {item.kind === 'skeleton' ? (
          <DonationListCardSkeleton />
        ) : (
          <DonationListCard
            program={item.program}
            variant="list"
            onPress={handlePressProgram}
          />
        )}
      </View>
    );
  }

  // Banner mengambil resep hero yang sama dengan screen donasi rutin lain
  // (gradient primary + FloatingOrbs), jadi tiga screen alur ini terbaca satu
  // keluarga. Jumlah program datang dari `total` — seluruh hasil filter, bukan
  // cuma halaman yang sudah dimuat.
  function renderBanner(): React.JSX.Element {
    return (
      <View style={styles.bannerBlock}>
        <LinearGradient
          colors={[colors.primary[200], colors.primary[50], colors.neutral[0]]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.bannerGradient}
        />
        <FloatingOrbs />
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Pilih Program Donasi Rutinmu</Text>
          <Text style={styles.bannerSubtitle}>
            Atur sekali, sedekahmu jalan otomatis tiap periode tanpa perlu
            diingat lagi.
          </Text>
          <View style={styles.bannerPill}>
            <Icon icon={HandHeart} size={18} color={colors.primary[700]} />
            <Text style={styles.bannerPillText}>
              {programList.isLoading
                ? 'Memuat program...'
                : `${programList.total.toLocaleString('id-ID')} program tersedia`}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  function renderListHeader(): React.JSX.Element {
    return (
      <View>
        {renderBanner()}
        <View style={styles.controlRow}>
          <DonationFilterDropdown
            value={programList.sortOption}
            onChange={programList.setSortOption}
          />
          <DonationSortDirectionToggle
            value={programList.sortDirection}
            onPress={programList.toggleSortDirection}
          />
        </View>
        {programList.isListLoading ? (
          <ActivityIndicator
            style={styles.listLoading}
            color={colors.primary[500]}
          />
        ) : null}
      </View>
    );
  }

  function renderEmpty(): React.JSX.Element | null {
    if (programList.isLoading) {
      return null;
    }
    return (
      <EmptyState
        icon={HandHeart}
        title="Program Tidak Ditemukan"
        description={
          searchQuery
            ? `Tidak ada program yang cocok dengan "${searchQuery}".`
            : 'Belum ada program yang bisa didonasikan rutin.'
        }
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.neutral[0]} barStyle="dark-content" />

      {/* Judul screen dilepas: field pencarian naik ke navbar, satu baris
          dengan tombol kembali — pola yang sama dengan header Home (logo +
          pencarian), cuma logonya diganti tombol kembali. */}
      <View style={[styles.header, {paddingTop: insets.top + spacing.md}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={ArrowLeft} size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <SearchField
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmit={() => setSearchQuery(searchInput.trim())}
            onClear={() => {
              setSearchInput('');
              setSearchQuery('');
            }}
            placeholder="Cari program donasi rutin"
            accessibilityLabel="Cari program donasi rutin"
          />
        </View>
      </View>

      <FlatList
        data={buildRows()}
        keyExtractor={(item, index) =>
          item.kind === 'skeleton'
            ? `skeleton-${item.id}`
            : `program-${item.program.id}-${index}`
        }
        renderItem={renderRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: insets.bottom + spacing.xl},
        ]}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          programList.isLoadingMore ? (
            <ActivityIndicator
              style={styles.listLoading}
              color={colors.primary[500]}
            />
          ) : null
        }
        onEndReachedThreshold={0.4}
        onEndReached={programList.loadMore}
        refreshControl={
          <RefreshControl
            refreshing={programList.isRefreshing}
            onRefresh={programList.refresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
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
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.neutral[0],
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
  },
  searchWrapper: {
    flex: 1,
  },
  bannerBlock: {
    overflow: 'hidden',
  },
  bannerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  banner: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  bannerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary[800],
    lineHeight: fontSize.xl * lineHeight.tight,
  },
  bannerSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[600],
  },
  bannerPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[0],
  },
  bannerPillText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  listLoading: {
    paddingVertical: spacing.md,
  },
  listContent: {
    gap: spacing.md,
  },
  itemWrapper: {
    paddingHorizontal: spacing.lg,
  },
});
