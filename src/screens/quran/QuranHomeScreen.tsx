import React, {useState} from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useHomeBackground} from '@/hooks/useHomeBackground';
import {QuranHomeHeader} from '@/components/shared/QuranHomeHeader';
import {QuranLocationBar} from '@/components/shared/QuranLocationBar';
import {QuranGreetingCard} from '@/components/shared/QuranGreetingCard';
import {QuranChallengeBanner} from '@/components/shared/QuranChallengeBanner';
import {QuranLastReadSection} from '@/components/shared/QuranLastReadSection';
import {QuranScheduleSection} from '@/components/shared/QuranScheduleSection';
import {useQuranHome} from '@/hooks/useQuranHome';
import {getJuzList} from '@/services/quranContentService';
import type {
  QuranProgressTab,
  QuranTabNavigationProp,
  RootStackNavigationProp,
} from '@/types/navigation';
import type {ChallengeSummary, LastReadTab, Schedule} from '@/types/quran';
import {colors, spacing} from '@/theme';

const SEE_ALL_TAB: Record<LastReadTab, QuranProgressTab> = {
  surah: 'surah',
  juz: 'juz',
  saved: 'saved',
};

function QuranHomeScreen(): React.JSX.Element {
  const tabNavigation = useNavigation<QuranTabNavigationProp>();
  const {Component: BackgroundComponent} = useHomeBackground();
  const [scrollY, setScrollY] = useState(0);

  const {
    location,
    hijriDate,
    userName,
    challenges,
    activeLastReadTab,
    surahHistory,
    juzHistory,
    savedSurahs,
    schedules,
    isLoading,
    isLastReadLoading,
    isRefreshing,
    changeLastReadTab,
    refresh,
  } = useQuranHome();

  function getRootNavigation(): RootStackNavigationProp | undefined {
    return tabNavigation.getParent<RootStackNavigationProp>();
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>): void {
    setScrollY(event.nativeEvent.contentOffset.y);
  }

  // `navigate`, bukan `push` — memulangkan ke instance Home yang sudah ada di
  // stack supaya state menu utama tidak ter-reset.
  function handlePressAppLogo(): void {
    getRootNavigation()?.navigate('Home');
  }

  function handlePressSearch(): void {
    getRootNavigation()?.navigate('QuranSearch');
  }

  function handlePressNotification(): void {
    getRootNavigation()?.navigate('Notifikasi');
  }

  // Sudah ikut -> langsung ke progres challenge. Belum ikut -> ke detail
  // supaya bisa dibaca dulu sebelum diambil.
  function handlePressChallenge(challenge: ChallengeSummary): void {
    const root = getRootNavigation();
    if (challenge.isJoined) {
      root?.navigate('QuranMyChallenge', {challengeId: challenge.id});
      return;
    }
    root?.navigate('QuranChallenge', {challengeId: challenge.id});
  }

  function handlePressSurah(surahNumber: number, ayahNumber: number): void {
    getRootNavigation()?.navigate('QuranReader', {surahNumber, ayahNumber});
  }

  function handlePressSaved(surahNumber: number): void {
    getRootNavigation()?.navigate('QuranReader', {surahNumber});
  }

  // Batas juz ada di juz.json, jadi juz dibuka tepat di ayat awalnya.
  function handlePressJuz(juzNumber: number): void {
    const juz = getJuzList().find(entry => entry.juzNumber === juzNumber);
    if (!juz) {
      tabNavigation.navigate('QuranProgress', {initialTab: 'juz'});
      return;
    }
    getRootNavigation()?.navigate('QuranReader', {
      surahNumber: juz.startSurah,
      ayahNumber: juz.startAyah,
    });
  }

  function handlePressLastReadSeeAll(): void {
    tabNavigation.navigate('QuranProgress', {
      initialTab: SEE_ALL_TAB[activeLastReadTab],
    });
  }

  function handlePressScheduleSeeAll(): void {
    tabNavigation.navigate('QuranProgress', {initialTab: 'schedule'});
  }

  function handlePressSchedule(schedule: Schedule): void {
    getRootNavigation()?.navigate('QuranScheduleDetail', {
      scheduleId: schedule.id,
    });
  }

  function handlePressCreateSchedule(): void {
    getRootNavigation()?.navigate('QuranScheduleForm', {});
  }

  return (
    <View style={styles.container}>
      <BackgroundComponent>
        <View style={styles.backgroundPlaceholder} />
      </BackgroundComponent>

      <QuranHomeHeader
        onPressAppLogo={handlePressAppLogo}
        onPressSearch={handlePressSearch}
        onPressNotification={handlePressNotification}
        headerBackgroundColor={scrollY > 0 ? colors.neutral[0] : undefined}
        searchBackgroundColor={
          scrollY > 0 ? colors.neutral[100] : colors.neutral[0]
        }
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
          }>
          {/* Section transparan supaya gradient latar tembus di belakangnya. */}
          <View style={[styles.section, styles.transparentSection]}>
            <QuranLocationBar location={location} hijriDate={hijriDate} />

            <QuranGreetingCard userName={userName} />

            <QuranChallengeBanner
              challenges={challenges}
              onPressChallenge={handlePressChallenge}
            />
          </View>

          <View style={styles.gap} />

          <View style={styles.section}>
            <QuranLastReadSection
              activeTab={activeLastReadTab}
              onChangeTab={changeLastReadTab}
              surahHistory={surahHistory}
              juzHistory={juzHistory}
              savedSurahs={savedSurahs}
              isLoading={isLastReadLoading}
              onPressSurah={handlePressSurah}
              onPressJuz={handlePressJuz}
              onPressSaved={handlePressSaved}
              onPressSeeAll={handlePressLastReadSeeAll}
            />
          </View>

          <View style={styles.gap} />

          <View style={styles.section}>
            <QuranScheduleSection
              schedules={schedules}
              isLoading={isLoading}
              onPressSchedule={handlePressSchedule}
              onPressSeeAll={handlePressScheduleSeeAll}
              onPressCreate={handlePressCreateSchedule}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

export default QuranHomeScreen;

// Susunan dan penamaan style mengikuti HomeScreen menu utama: latar absolut,
// header tetap di atas, lalu deretan `section` putih yang dipisah `gap` abu.
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: 0,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingBottom: spacing['2xl'],
  },
  section: {
    backgroundColor: colors.neutral[0],
  },
  transparentSection: {
    backgroundColor: 'transparent',
  },
  gap: {
    height: spacing.md,
    backgroundColor: colors.neutral[50],
  },
});
