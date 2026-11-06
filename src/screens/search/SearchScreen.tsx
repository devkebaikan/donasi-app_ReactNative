import React, {useMemo, useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {
  ArrowLeft,
  Magnifer,
  CloseCircle,
  ClockCircle,
  AltArrowRight,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {useSearch} from '@/hooks/useSearch';
import {useDebouncedValue} from '@/hooks/useDebouncedValue';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {RootStackNavigationProp} from '@/types/navigation';

const DONATION_THUMBNAIL_WIDTH = 80;

interface TopSearch {
  id: string;
  query: string;
  count: number;
}

interface TopDonation {
  id: string;
  title: string;
  image: string;
  searchCount: number;
}

const DONATION_IMAGE_URL =
  'https://cdn.aksiberbagi.com/settings/home-banner-1777532258.jpeg';
const SEARCH_FILTER_DEBOUNCE_MS = 400;

const TOP_DONATIONS: TopDonation[] = [
  {
    id: '1',
    title: 'Zakat Penghasilan untuk Dhuafa',
    image: DONATION_IMAGE_URL,
    searchCount: 245,
  },
  {
    id: '2',
    title: 'Beasiswa Penuh untuk Santri Berprestasi',
    image: DONATION_IMAGE_URL,
    searchCount: 189,
  },
  {
    id: '3',
    title: 'Bantuan Air Bersih di Daerah Terpencil',
    image: DONATION_IMAGE_URL,
    searchCount: 156,
  },
];

const TOP_KEYWORDS: TopSearch[] = [
  {id: '1', query: 'zakat', count: 532},
  {id: '2', query: 'palestina', count: 478},
  {id: '3', query: 'beasiswa', count: 412},
  {id: '4', query: 'infak', count: 389},
];

const DEFAULT_ASPECT_RATIO = 1080 / 1920; // 16:9

function DonationSearchItem({
  donation,
  onPress,
  imageHeights,
  setImageHeights,
}: {
  donation: TopDonation;
  onPress: () => void;
  imageHeights: Record<string, number>;
  setImageHeights: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}): React.JSX.Element {
  const imageHeight = imageHeights[donation.id] ?? DONATION_THUMBNAIL_WIDTH * DEFAULT_ASPECT_RATIO;

  useEffect(() => {
    Image.getSize(
      donation.image,
      (width, height) => {
        const aspectRatio = height / width;
        setImageHeights(prev => ({
          ...prev,
          [donation.id]: DONATION_THUMBNAIL_WIDTH * aspectRatio,
        }));
      },
      () => {
        setImageHeights(prev => ({
          ...prev,
          [donation.id]: DONATION_THUMBNAIL_WIDTH * DEFAULT_ASPECT_RATIO,
        }));
      },
    );
  }, [donation.image, donation.id, setImageHeights]);

  return (
    <TouchableOpacity
      style={styles.donationItem}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={donation.title}>
      <Image
        source={{uri: donation.image}}
        style={[styles.donationThumbnail, {width: DONATION_THUMBNAIL_WIDTH, height: imageHeight}]}
        resizeMode="cover"
        accessibilityRole="image"
        accessibilityLabel={donation.title}
      />
      <View style={styles.donationContent}>
        <Text style={styles.donationTitle} numberOfLines={2}>
          {donation.title}
        </Text>
        <Text style={styles.donationCount}>
          {donation.searchCount} pencarian
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function SearchScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const insets = useSafeAreaInsets();
  const {recentSearches, addRecentSearch, clearRecentSearches} = useSearch();

  // Display field: updates on every keystroke so the TextInput never feels laggy.
  const [searchQuery, setSearchQuery] = useState('');
  // Real field: settles 400ms after typing stops. All suggestion filtering
  // below reads this instead of searchQuery, so it doesn't re-filter on every keystroke.
  const debouncedSearchQuery = useDebouncedValue(
    searchQuery,
    SEARCH_FILTER_DEBOUNCE_MS,
  );
  const normalizedQuery = debouncedSearchQuery.trim().toLowerCase();

  const [isLoading] = useState(false);
  const [imageHeights, setImageHeights] = useState<Record<string, number>>({});

  const filteredRecentSearches = useMemo(
    () =>
      normalizedQuery
        ? recentSearches.filter(query =>
            query.toLowerCase().includes(normalizedQuery),
          )
        : recentSearches,
    [recentSearches, normalizedQuery],
  );

  const filteredTopDonations = useMemo(
    () =>
      normalizedQuery
        ? TOP_DONATIONS.filter(donation =>
            donation.title.toLowerCase().includes(normalizedQuery),
          )
        : TOP_DONATIONS,
    [normalizedQuery],
  );

  const filteredTopKeywords = useMemo(
    () =>
      normalizedQuery
        ? TOP_KEYWORDS.filter(keyword =>
            keyword.query.toLowerCase().includes(normalizedQuery),
          )
        : TOP_KEYWORDS,
    [normalizedQuery],
  );

  const hasNoMatches =
    normalizedQuery.length > 0 &&
    filteredRecentSearches.length === 0 &&
    filteredTopDonations.length === 0 &&
    filteredTopKeywords.length === 0;

  function handleBack(): void {
    navigation.goBack();
  }

  function handleSearch(): void {
    if (!searchQuery.trim()) {
      return;
    }
    addRecentSearch(searchQuery);
    navigation.navigate('Home', {
      screen: 'Donations',
      params: {search: searchQuery},
    });
  }

  function handleDonationPress(id: string): void {
    navigation.navigate('DetailProgram', {link: id});
  }

  function handleKeywordPress(keyword: string): void {
    setSearchQuery(keyword);
    addRecentSearch(keyword);
    navigation.navigate('Home', {
      screen: 'Donations',
      params: {search: keyword},
    });
  }

  function handleRecentSearchPress(query: string): void {
    setSearchQuery(query);
    addRecentSearch(query);
    navigation.navigate('Home', {
      screen: 'Donations',
      params: {search: query},
    });
  }

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon
            icon={ArrowLeft}
            size={24}
            color={colors.neutral[700]}
          />
        </TouchableOpacity>

        <View style={styles.searchInputWrapper}>
          <Icon
            icon={Magnifer}
            size={20}
            color={colors.neutral[400]}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari donasi..."
            placeholderTextColor={colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Hapus pencarian">
              <Icon
                icon={CloseCircle}
                size={20}
                color={colors.neutral[400]}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}>
          {/* Recent Searches */}
          {filteredRecentSearches.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pencarian Terakhir</Text>
                <TouchableOpacity
                  onPress={clearRecentSearches}
                  accessibilityRole="button"
                  accessibilityLabel="Hapus riwayat pencarian">
                  <Text style={styles.clearButtonText}>Hapus</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.keywordContainer}>
                {filteredRecentSearches.map(query => (
                  <TouchableOpacity
                    key={query}
                    style={styles.recentChip}
                    onPress={() => handleRecentSearchPress(query)}
                    accessibilityRole="button"
                    accessibilityLabel={query}>
                    <Icon
                      icon={ClockCircle}
                      size={14}
                      color={colors.neutral[500]}
                    />
                    <Text style={styles.recentChipText}>{query}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* Top Donations */}
          {filteredTopDonations.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Donasi Paling Banyak Dicari
              </Text>
              <View style={styles.listContainer}>
                {filteredTopDonations.map(donation => (
                  <DonationSearchItem
                    key={donation.id}
                    donation={donation}
                    onPress={() => handleDonationPress(donation.id)}
                    imageHeights={imageHeights}
                    setImageHeights={setImageHeights}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {/* Top Keywords */}
          {filteredTopKeywords.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Keyword Paling Banyak Dicari
              </Text>
              <View style={styles.keywordContainer}>
                {filteredTopKeywords.map(keyword => (
                  <TouchableOpacity
                    key={keyword.id}
                    style={styles.keywordChip}
                    onPress={() => handleKeywordPress(keyword.query)}
                    accessibilityRole="button"
                    accessibilityLabel={keyword.query}>
                    <Text style={styles.keywordText}>{keyword.query}</Text>
                    <Text style={styles.keywordCount}>{keyword.count}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* No Match */}
          {hasNoMatches ? (
            <TouchableOpacity
              style={styles.continueSearchButton}
              onPress={handleSearch}
              accessibilityRole="button"
              accessibilityLabel="Lanjutkan pencarian">
              <Text style={styles.continueSearchText}>Lanjutkan pencarian</Text>
              <Icon icon={AltArrowRight} size={18} color={colors.primary[600]} />
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      )}
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
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
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
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  clearButtonText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.primary[600],
  },
  listContainer: {
    gap: spacing.sm,
  },
  donationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
    gap: spacing.md,
  },
  donationThumbnail: {
    borderRadius: radius.md,
    backgroundColor: colors.neutral[200],
  },
  donationContent: {
    flex: 1,
    gap: spacing.xs,
  },
  donationTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  donationCount: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  keywordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    gap: spacing.xs,
  },
  recentChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  keywordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
    gap: spacing.xs,
  },
  keywordText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary[600],
  },
  keywordCount: {
    fontSize: fontSize.xs,
    color: colors.primary[500],
  },
  continueSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  continueSearchText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
});
