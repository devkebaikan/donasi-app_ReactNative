import React, {useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon} from '@/components/ui/Icon';
import {
  ArrowLeft,
  Magnifer,
  CloseCircle,
  BookBookmark,
} from '@solar-icons/react-native/Linear';
import {EmptyState} from '@/components/ui/EmptyState';
import {QuranSurahListItem} from '@/components/shared/QuranSurahListItem';
import {QuranSearchHistoryList} from '@/components/shared/QuranSearchHistoryList';
import {useQuranSearch} from '@/hooks/useQuranSearch';
import type {RootStackNavigationProp} from '@/types/navigation';
import type {SurahMeta} from '@/types/quran';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

function keyExtractor(surah: SurahMeta): string {
  return String(surah.number);
}

function QuranSearchScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const {
    keyword,
    results,
    recentSearches,
    isSearching,
    hasNoResult,
    setKeyword,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useQuranSearch();

  // Hasil pencarian dibawa ke tab Surah, tidak dibuka langsung ke reader —
  // supaya user masih bisa menyaring lagi di sana.
  function goToSurahList(query: string): void {
    addRecentSearch(query);
    navigation.navigate('QuranTabs', {
      screen: 'QuranSurahList',
      params: {search: query},
    });
  }

  function handleBack(): void {
    navigation.goBack();
  }

  function handleSubmit(): void {
    if (!keyword.trim()) {
      return;
    }
    goToSurahList(keyword.trim());
  }

  function handlePressSurah(surah: SurahMeta): void {
    goToSurahList(surah.nameLatin);
  }

  function handlePressRecent(query: string): void {
    setKeyword(query);
    goToSurahList(query);
  }

  function handleClearInput(): void {
    setKeyword('');
    inputRef.current?.focus();
  }

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={ArrowLeft} size={24} color={colors.neutral[700]} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Icon icon={Magnifer} size={20} color={colors.neutral[400]} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Cari surah..."
            placeholderTextColor={colors.neutral[400]}
            returnKeyType="search"
            onSubmitEditing={handleSubmit}
            autoFocus
            autoCorrect={false}
            accessibilityLabel="Cari surah"
          />
          {keyword.length > 0 ? (
            <TouchableOpacity
              onPress={handleClearInput}
              hitSlop={styles.clearHitSlop}
              accessibilityRole="button"
              accessibilityLabel="Hapus teks pencarian">
              <Icon icon={CloseCircle} size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {isSearching ? (
        hasNoResult ? (
          <EmptyState
            icon={BookBookmark}
            title="Surah tidak ditemukan"
            description="Coba periksa ejaannya, atau cari dengan nomor surah."
          />
        ) : (
          <FlatList
            data={results}
            keyExtractor={keyExtractor}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            renderItem={({item}) => (
              <QuranSurahListItem surah={item} onPress={handlePressSurah} />
            )}
          />
        )
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <QuranSearchHistoryList
            recentSearches={recentSearches}
            onPressItem={handlePressRecent}
            onRemoveItem={removeRecentSearch}
            onClearAll={clearRecentSearches}
          />
          {recentSearches.length === 0 ? (
            <Text style={styles.hint}>
              Cari surah berdasarkan nama, arti, atau nomornya.
            </Text>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

export default QuranSearchScreen;

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
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    padding: 0,
  },
  clearHitSlop: {top: 8, bottom: 8, left: 8, right: 8},
  list: {
    paddingTop: spacing.sm,
    paddingBottom: spacing['2xl'],
  },
  hint: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.neutral[500],
  },
});
