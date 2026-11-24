import React from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon} from '@/components/ui/Icon';
import {
  Magnifer,
  CloseCircle,
  BookBookmark,
} from '@solar-icons/react-native/Linear';
import {EmptyState} from '@/components/ui/EmptyState';
import {Button} from '@/components/ui/Button';
import {QuranChallengeCarousel} from '@/components/shared/QuranChallengeCarousel';
import {QuranJuzFilterDropdown} from '@/components/shared/QuranJuzFilterDropdown';
import {DonationSortDirectionToggle} from '@/components/shared/DonationSortDirectionToggle';
import {QuranSurahListItem} from '@/components/shared/QuranSurahListItem';
import {useQuranSurahList} from '@/hooks/useQuranSurahList';
import type {
  QuranTabNavigationProp,
  QuranTabParamList,
  RootStackNavigationProp,
} from '@/types/navigation';
import type {ChallengeSummary, Surah, SurahMeta} from '@/types/quran';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

// 114 item ringan untuk sekali render, tapi jendela awalnya tetap dibatasi
// supaya frame pertama tidak menunggu seluruh daftar terpasang.
const INITIAL_RENDER_COUNT = 15;

function keyExtractor(surah: Surah): string {
  return String(surah.number);
}

function QuranSurahListScreen(): React.JSX.Element {
  const navigation = useNavigation<QuranTabNavigationProp>();
  const route = useRoute<RouteProp<QuranTabParamList, 'QuranSurahList'>>();
  const insets = useSafeAreaInsets();

  const {
    surahs,
    challenges,
    keyword,
    juzFilter,
    sortDirection,
    hasActiveFilter,
    isEmpty,
    setJuzFilter,
    toggleSortDirection,
    clearKeyword,
    clearAllFilters,
    getResumeAyah,
  } = useQuranSurahList({
    initialSearch: route.params?.search,
    initialJuz: route.params?.juz,
  });

  function getRootNavigation(): RootStackNavigationProp | undefined {
    return navigation.getParent<RootStackNavigationProp>();
  }

  function handlePressSearch(): void {
    getRootNavigation()?.navigate('QuranSearch');
  }

  function handlePressChallenge(challenge: ChallengeSummary): void {
    const root = getRootNavigation();
    if (challenge.isJoined) {
      root?.navigate('QuranMyChallenge', {challengeId: challenge.id});
      return;
    }
    root?.navigate('QuranChallenge', {challengeId: challenge.id});
  }

  // Lanjut dari ayat terakhir yang dibaca; surah yang belum pernah dibuka
  // dimulai dari ayat 1.
  function handlePressSurah(surah: SurahMeta): void {
    getRootNavigation()?.navigate('QuranReader', {
      surahNumber: surah.number,
      ayahNumber: getResumeAyah(surah.number),
    });
  }

  function renderHeader(): React.JSX.Element {
    return (
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={handlePressSearch}
          accessibilityRole="button"
          accessibilityLabel={
            keyword ? `Pencarian aktif: ${keyword}` : 'Cari surah'
          }>
          <Icon icon={Magnifer} size={20} color={colors.neutral[400]} />
          <Text
            style={[styles.searchText, keyword ? styles.searchTextActive : null]}
            numberOfLines={1}>
            {keyword || 'Cari surah...'}
          </Text>
          {keyword ? (
            <TouchableOpacity
              onPress={clearKeyword}
              hitSlop={styles.clearHitSlop}
              accessibilityRole="button"
              accessibilityLabel="Hapus pencarian">
              <Icon icon={CloseCircle} size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>

        <QuranChallengeCarousel
          challenges={challenges}
          onPressChallenge={handlePressChallenge}
        />

        <View style={styles.filterRow}>
          <QuranJuzFilterDropdown value={juzFilter} onChange={setJuzFilter} />
          <DonationSortDirectionToggle
            value={sortDirection}
            onPress={toggleSortDirection}
            size="md"
          />
        </View>
      </View>
    );
  }

  function renderEmpty(): React.JSX.Element | null {
    if (!isEmpty) {
      return null;
    }
    return (
      <View style={styles.empty}>
        <EmptyState
          icon={BookBookmark}
          title="Surah tidak ditemukan"
          description={
            juzFilter != null
              ? 'Tidak ada surah yang cocok di juz ini.'
              : 'Coba periksa ejaannya, atau cari dengan nomor surah.'
          }
        />
        {juzFilter != null ? (
          <Button
            label="Tampilkan Semua Juz"
            variant="secondary"
            onPress={() => setJuzFilter(null)}
          />
        ) : null}
        {hasActiveFilter ? (
          <Button
            label="Hapus Semua Filter"
            variant="ghost"
            onPress={clearAllFilters}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <FlatList
        data={surahs}
        keyExtractor={keyExtractor}
        initialNumToRender={INITIAL_RENDER_COUNT}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <QuranSurahListItem surah={item} onPress={handlePressSurah} />
        )}
      />
    </View>
  );
}

export default QuranSurahListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  list: {
    paddingBottom: spacing['2xl'],
  },
  header: {
    gap: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  searchBar: {
    marginHorizontal: spacing.lg,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
  },
  searchText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.neutral[400],
  },
  searchTextActive: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  clearHitSlop: {top: 8, bottom: 8, left: 8, right: 8},
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  empty: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});
