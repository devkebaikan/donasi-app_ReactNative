import React from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BookBookmark} from '@solar-icons/react-native/Linear';
import {EmptyState} from '@/components/ui/EmptyState';
import {Button} from '@/components/ui/Button';
import {HtmlContent} from '@/components/shared/HtmlContent';
import {QuranChallengeHeader} from '@/components/shared/QuranChallengeHeader';
import {QuranChallengeTabBar} from '@/components/shared/QuranChallengeTabBar';
import {QuranSurahListItem} from '@/components/shared/QuranSurahListItem';
import {useQuranChallenge} from '@/hooks/useQuranChallenge';
import type {RootStackNavigationProp, RootStackParamList} from '@/types/navigation';
import type {SurahMeta} from '@/types/quran';
import {colors, spacing} from '@/theme';

function QuranChallengeScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'QuranChallenge'>>();
  const insets = useSafeAreaInsets();
  const {challengeId} = route.params;

  const {
    challenge,
    surahs,
    activeTab,
    isLoading,
    isNotFound,
    isJoining,
    changeTab,
    join,
  } = useQuranChallenge(challengeId);

  function handleBack(): void {
    navigation.goBack();
  }

  function handlePressSurah(surah: SurahMeta): void {
    navigation.navigate('QuranReader', {surahNumber: surah.number});
  }

  function goToMyChallenge(): void {
    navigation.replace('QuranMyChallenge', {challengeId});
  }

  async function handlePressCta(): Promise<void> {
    if (challenge?.isJoined) {
      goToMyChallenge();
      return;
    }
    const success = await join();
    if (success) {
      goToMyChallenge();
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary[500]} />
      </View>
    );
  }

  if (isNotFound || !challenge) {
    return (
      <View style={[styles.centered, styles.errorPadding]}>
        <EmptyState
          icon={BookBookmark}
          title="Challenge tidak ditemukan"
          description="Challenge ini mungkin sudah dihapus."
        />
        <Button label="Kembali" variant="secondary" onPress={handleBack} />
      </View>
    );
  }

  // Tombol tidak pernah disabled saat idle — hanya saat proses ikut berjalan,
  // atau saat challenge sudah berakhir dan belum diikuti.
  const isEndedAndNotJoined = challenge.isEnded && !challenge.isJoined;
  const ctaLabel = challenge.isJoined
    ? 'Challenge Saya'
    : isEndedAndNotJoined
      ? 'Challenge Berakhir'
      : 'Ikuti Challenge';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <QuranChallengeHeader
          name={challenge.name}
          imageUrl={challenge.imageUrl}
          participantCount={challenge.participantCount}
          startDate={challenge.startDate}
          endDate={challenge.endDate}
          isEnded={challenge.isEnded}
          onBack={handleBack}
        />

        <QuranChallengeTabBar activeTab={activeTab} onChange={changeTab} />

        {activeTab === 'detail' ? (
          <View style={styles.tabContent}>
            {challenge.descriptionHtml ? (
              <HtmlContent html={challenge.descriptionHtml} />
            ) : (
              <EmptyState
                icon={BookBookmark}
                title="Belum ada penjelasan"
                description="Penjelasan untuk challenge ini belum tersedia."
              />
            )}
          </View>
        ) : surahs.length > 0 ? (
          <View>
            {surahs.map(surah => (
              <QuranSurahListItem
                key={surah.number}
                surah={surah}
                onPress={handlePressSurah}
              />
            ))}
          </View>
        ) : (
          <View style={styles.tabContent}>
            <EmptyState
              icon={BookBookmark}
              title="Daftar surah belum ditentukan"
              description="Surah untuk challenge ini belum diatur."
            />
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + spacing.md}]}>
        <Button
          label={ctaLabel}
          onPress={handlePressCta}
          isLoading={isJoining}
          isDisabled={isEndedAndNotJoined}
        />
      </View>
    </View>
  );
}

export default QuranChallengeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[0],
  },
  errorPadding: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  scroll: {
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
  tabContent: {
    paddingHorizontal: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
});
