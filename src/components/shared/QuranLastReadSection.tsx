import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {EmptyState} from '@/components/ui/EmptyState';
import {BookBookmark} from '@solar-icons/react-native/Linear';
import {QuranLastReadItem} from '@/components/shared/QuranLastReadItem';
import {Button} from '@/components/ui/Button';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {
  JuzReadingHistory,
  LastReadTab,
  SavedSurah,
  SurahReadingHistory,
} from '@/types/quran';

interface TabOption {
  value: LastReadTab;
  label: string;
}

const TAB_OPTIONS: TabOption[] = [
  {value: 'surah', label: 'Surah'},
  {value: 'juz', label: 'Juz'},
  {value: 'saved', label: 'Disimpan'},
];

const EMPTY_MESSAGE: Record<LastReadTab, string> = {
  surah: 'Belum ada bacaan. Mulai dari surah favoritmu.',
  juz: 'Belum ada juz yang dibaca.',
  saved: 'Belum ada surah yang disimpan.',
};

interface QuranLastReadSectionProps {
  activeTab: LastReadTab;
  onChangeTab: (tab: LastReadTab) => void;
  surahHistory: SurahReadingHistory[];
  juzHistory: JuzReadingHistory[];
  savedSurahs: SavedSurah[];
  isLoading: boolean;
  onPressSurah: (surahNumber: number, ayahNumber: number) => void;
  onPressJuz: (juzNumber: number) => void;
  onPressSaved: (surahNumber: number) => void;
  onPressSeeAll: () => void;
}

export function QuranLastReadSection({
  activeTab,
  onChangeTab,
  surahHistory,
  juzHistory,
  savedSurahs,
  isLoading,
  onPressSurah,
  onPressJuz,
  onPressSaved,
  onPressSeeAll,
}: QuranLastReadSectionProps): React.JSX.Element {
  const isEmpty =
    !isLoading &&
    ((activeTab === 'surah' && surahHistory.length === 0) ||
      (activeTab === 'juz' && juzHistory.length === 0) ||
      (activeTab === 'saved' && savedSurahs.length === 0));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Bacaan Terakhir</Text>

      <View style={styles.tabBar}>
        {TAB_OPTIONS.map(option => {
          const isActive = option.value === activeTab;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onChangeTab(option.value)}
              accessibilityRole="tab"
              accessibilityLabel={option.label}
              accessibilityState={{selected: isActive}}>
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isEmpty ? (
        <EmptyState
          icon={BookBookmark}
          title="Belum ada data"
          description={EMPTY_MESSAGE[activeTab]}
        />
      ) : (
        <View>
          {activeTab === 'surah' &&
            surahHistory.map(item => (
              <QuranLastReadItem
                key={item.surahNumber}
                number={item.surahNumber}
                title={`${item.surahNameLatin} (${item.totalAyah})`}
                arabicName={item.surahNameArabic}
                subtitle={
                  item.isCompleted
                    ? 'Selesai dibaca'
                    : `Ayat ${item.lastAyah} dari ${item.totalAyah}`
                }
                onPress={() => onPressSurah(item.surahNumber, item.lastAyah)}
                accessibilityLabel={`Lanjutkan ${item.surahNameLatin} ayat ${item.lastAyah}`}
              />
            ))}

          {activeTab === 'juz' &&
            juzHistory.map(item => (
              <QuranLastReadItem
                key={item.juzNumber}
                number={item.juzNumber}
                title={`Juz ${item.juzNumber}`}
                subtitle={`${item.readAyahCount} dari ${item.totalAyahCount} ayat · ${item.percentage}%`}
                onPress={() => onPressJuz(item.juzNumber)}
                accessibilityLabel={`Juz ${item.juzNumber}, ${item.percentage} persen`}
              />
            ))}

          {activeTab === 'saved' &&
            savedSurahs.map(item => (
              <QuranLastReadItem
                key={item.surahNumber}
                number={item.surahNumber}
                title={`${item.surahNameLatin} (${item.totalAyah})`}
                arabicName={item.surahNameArabic}
                subtitle="Disimpan"
                onPress={() => onPressSaved(item.surahNumber)}
                accessibilityLabel={`Buka ${item.surahNameLatin}`}
              />
            ))}
        </View>
      )}

      {/* Pola tombol "lihat lainnya" di bawah daftar mengikuti
          ProgramListSection di menu utama: Button variant ghost, lebar penuh
          dengan margin horizontal. */}
      <View style={styles.seeAllWrapper}>
        <Button label="Lihat Semua" variant="ghost" onPress={onPressSeeAll} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  seeAllWrapper: {
    marginHorizontal: spacing.lg,
  },
  sectionTitle: {
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  tabActive: {
    backgroundColor: colors.neutral[0],
  },
  tabLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
  },
  tabLabelActive: {
    color: colors.primary[600],
    fontWeight: fontWeight.semiBold,
  },
});
