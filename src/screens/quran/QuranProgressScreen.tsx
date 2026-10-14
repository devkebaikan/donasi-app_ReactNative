import React from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import {BookBookmark, Calendar} from '@solar-icons/react-native/Linear';
import {EmptyState} from '@/components/ui/EmptyState';
import {Button} from '@/components/ui/Button';
import {QuranProgressHeader} from '@/components/shared/QuranProgressHeader';
import {QuranProgressTabBar} from '@/components/shared/QuranProgressTabBar';
import {
  QuranSurahProgressItem,
  QuranJuzProgressItem,
  QuranSavedSurahItem,
  QuranScheduleListCard,
} from '@/components/shared/QuranProgressListItems';
import {QuranConfirmDialog} from '@/components/shared/QuranConfirmDialog';
import {getJuzList} from '@/services/quranContentService';
import {useQuranProgress} from '@/hooks/useQuranProgress';
import type {
  QuranTabNavigationProp,
  QuranTabParamList,
  RootStackNavigationProp,
} from '@/types/navigation';
import type {
  JuzReadingHistory,
  SavedSurah,
  Schedule,
  SurahReadingHistory,
} from '@/types/quran';
import {colors, spacing} from '@/theme';

function QuranProgressScreen(): React.JSX.Element {
  const navigation = useNavigation<QuranTabNavigationProp>();
  const route = useRoute<RouteProp<QuranTabParamList, 'QuranProgress'>>();

  const {
    summary,
    activeTab,
    surahHistory,
    juzHistory,
    savedSurahs,
    schedules,
    isTabLoading,
    isRefreshing,
    deleteTarget,
    isDeleting,
    changeTab,
    refresh,
    askDelete,
    cancelDelete,
    confirmDelete,
  } = useQuranProgress(route.params?.initialTab ?? 'surah');

  function getRootNavigation(): RootStackNavigationProp | undefined {
    return navigation.getParent<RootStackNavigationProp>();
  }

  function openReader(surahNumber: number, ayahNumber?: number): void {
    getRootNavigation()?.navigate('QuranReader', {surahNumber, ayahNumber});
  }

  function handlePressSurah(item: SurahReadingHistory): void {
    openReader(item.surahNumber, item.lastAyah);
  }

  // Batas juz ada di juz.json, jadi juz bisa dibuka tepat di ayat awalnya —
  // bukan sekadar di surah pertama yang dilewatinya.
  function handlePressJuz(item: JuzReadingHistory): void {
    const juz = getJuzList().find(entry => entry.juzNumber === item.juzNumber);
    if (!juz) {
      return;
    }
    openReader(juz.startSurah, juz.startAyah);
  }

  function handlePressSaved(item: SavedSurah): void {
    openReader(item.surahNumber);
  }

  function handlePressSchedule(schedule: Schedule): void {
    getRootNavigation()?.navigate('QuranScheduleDetail', {
      scheduleId: schedule.id,
    });
  }

  function handleEditSchedule(schedule: Schedule): void {
    getRootNavigation()?.navigate('QuranScheduleForm', {
      scheduleId: schedule.id,
    });
  }

  function handleCreateSchedule(): void {
    getRootNavigation()?.navigate('QuranScheduleForm', {});
  }

  function renderTabContent(): React.JSX.Element {
    if (isTabLoading) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      );
    }

    if (activeTab === 'surah') {
      if (surahHistory.length === 0) {
        return (
          <EmptyState
            icon={BookBookmark}
            title="Belum ada bacaan"
            description="Mulai membaca dan riwayatnya akan muncul di sini."
          />
        );
      }
      return (
        <View>
          {surahHistory.map(item => (
            <QuranSurahProgressItem
              key={item.surahNumber}
              item={item}
              onPress={handlePressSurah}
            />
          ))}
        </View>
      );
    }

    if (activeTab === 'juz') {
      return (
        <View>
          {juzHistory.map(item => (
            <QuranJuzProgressItem
              key={item.juzNumber}
              item={item}
              onPress={handlePressJuz}
            />
          ))}
        </View>
      );
    }

    if (activeTab === 'saved') {
      if (savedSurahs.length === 0) {
        return (
          <EmptyState
            icon={BookBookmark}
            title="Belum ada surah yang disimpan"
            description="Simpan surah dari halaman baca untuk membukanya cepat."
          />
        );
      }
      return (
        <View>
          {savedSurahs.map(item => (
            <QuranSavedSurahItem
              key={item.surahNumber}
              item={item}
              onPress={handlePressSaved}
              onPressDelete={saved =>
                askDelete({
                  type: 'bookmark',
                  id: String(saved.surahNumber),
                  label: saved.surahNameLatin,
                })
              }
            />
          ))}
        </View>
      );
    }

    return (
      <View style={styles.scheduleTab}>
        {schedules.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Belum ada jadwal"
            description="Atur jadwal tilawahmu agar bacaan lebih teratur."
          />
        ) : (
          schedules.map(schedule => (
            <QuranScheduleListCard
              key={schedule.id}
              schedule={schedule}
              onPress={handlePressSchedule}
              onPressEdit={handleEditSchedule}
              onPressDelete={item =>
                askDelete({
                  type: 'schedule',
                  id: item.id,
                  label: item.surahNameLatin,
                })
              }
            />
          ))
        )}

        {/* Tombol tambah di bawah daftar, bukan floating — pola yang sama
            dengan RecurringDonationScreen. */}
        <View style={styles.addButton}>
          <Button
            label="+ Tambah Jadwal"
            variant="secondary"
            onPress={handleCreateSchedule}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }>
        <QuranProgressHeader
          completedSurahCount={summary?.completedSurahCount ?? 0}
          completedJuzCount={summary?.completedJuzCount ?? 0}
        />

        <QuranProgressTabBar activeTab={activeTab} onChange={changeTab} />

        <View style={styles.tabContent}>{renderTabContent()}</View>
      </ScrollView>

      <QuranConfirmDialog
        visible={deleteTarget != null}
        title={
          deleteTarget?.type === 'schedule'
            ? 'Hapus jadwal ini?'
            : 'Hapus dari daftar simpan?'
        }
        description={
          deleteTarget?.type === 'schedule'
            ? `Jadwal ${deleteTarget.label} akan dihapus. Progres bacaanmu tidak ikut terhapus.`
            : `${deleteTarget?.label ?? 'Surah ini'} akan dihapus dari daftar simpan.`
        }
        confirmLabel="Hapus"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </View>
  );
}

export default QuranProgressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  scroll: {
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
  },
  tabContent: {
    minHeight: 200,
  },
  loading: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  scheduleTab: {
    gap: spacing.sm,
  },
  addButton: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});
