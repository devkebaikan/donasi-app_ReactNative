import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import {BookBookmark} from '@solar-icons/react-native/Linear';
import {EmptyState} from '@/components/ui/EmptyState';
import {Button} from '@/components/ui/Button';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {QuranChallengeProgressHeader} from '@/components/shared/QuranChallengeProgressHeader';
import {QuranChallengeSurahProgressItem} from '@/components/shared/QuranChallengeSurahProgressItem';
import {QuranLeaveChallengeDialog} from '@/components/shared/QuranLeaveChallengeDialog';
import {useQuranMyChallenge} from '@/hooks/useQuranMyChallenge';
import type {RootStackNavigationProp, RootStackParamList} from '@/types/navigation';
import type {ChallengeSurahProgress} from '@/types/quran';
import {colors, spacing, fontSize, fontWeight} from '@/theme';

function QuranMyChallengeScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'QuranMyChallenge'>>();
  const {challengeId} = route.params;

  const {
    progress,
    isLoading,
    isNotFound,
    isAllCompleted,
    isLeaveDialogOpen,
    isLeaving,
    openLeaveDialog,
    closeLeaveDialog,
    confirmLeave,
  } = useQuranMyChallenge(challengeId);

  function handleBack(): void {
    navigation.goBack();
  }

  // Surah yang belum selesai dilanjutkan dari ayat terakhir; yang belum
  // pernah dibaca mulai dari ayat 1.
  function handlePressSurah(surah: ChallengeSurahProgress): void {
    navigation.navigate('QuranReader', {
      surahNumber: surah.surahNumber,
      ayahNumber: Math.max(1, surah.readAyah),
    });
  }

  async function handleConfirmLeave(): Promise<void> {
    const success = await confirmLeave();
    if (success) {
      navigation.goBack();
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <HeaderLight title="Challenge Saya" onBack={handleBack} />
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      </View>
    );
  }

  if (isNotFound || !progress) {
    return (
      <View style={styles.container}>
        <HeaderLight title="Challenge Saya" onBack={handleBack} />
        <View style={styles.errorState}>
          <EmptyState
            icon={BookBookmark}
            title="Challenge tidak ditemukan"
            description="Challenge ini mungkin sudah dihapus."
          />
          <Button label="Kembali" variant="secondary" onPress={handleBack} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderLight title="Challenge Saya" onBack={handleBack} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <QuranChallengeProgressHeader
          name={progress.name}
          percentage={progress.percentage}
          completedSurahCount={progress.completedSurahCount}
          totalSurahCount={progress.totalSurahCount}
          remainingDays={progress.remainingDays}
          isEnded={progress.isEnded}
          isAllCompleted={isAllCompleted}
        />

        <Text style={styles.sectionTitle}>Daftar Surah</Text>

        {progress.surahs.map(surah => (
          <QuranChallengeSurahProgressItem
            key={surah.surahNumber}
            surah={surah}
            onPress={handlePressSurah}
          />
        ))}

        {/* Tombol keluar disembunyikan kalau semua surah sudah selesai —
            tidak ada gunanya keluar dari challenge yang sudah tuntas. */}
        {isAllCompleted ? null : (
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={openLeaveDialog}
            accessibilityRole="button"
            accessibilityLabel="Keluar dari challenge">
            <Text style={styles.leaveLabel}>Keluar dari Challenge</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <QuranLeaveChallengeDialog
        visible={isLeaveDialogOpen}
        isLoading={isLeaving}
        onConfirm={handleConfirmLeave}
        onCancel={closeLeaveDialog}
      />
    </View>
  );
}

export default QuranMyChallengeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  scroll: {
    paddingBottom: spacing['2xl'],
  },
  sectionTitle: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  leaveButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  leaveLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.semantic.error,
  },
});
