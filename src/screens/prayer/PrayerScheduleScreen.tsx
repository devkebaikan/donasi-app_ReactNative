import React from 'react';
import {View, ScrollView, RefreshControl, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {DangerCircle} from '@solar-icons/react-native/Linear';
import {EmptyState} from '@/components/ui/EmptyState';
import {Button} from '@/components/ui/Button';
import {PrayerScheduleHeader} from '@/components/shared/PrayerScheduleHeader';
import {PrayerSchedulePanel} from '@/components/shared/PrayerSchedulePanel';
import {PrayerScheduleSkeleton} from '@/components/shared/PrayerScheduleSkeleton';
import {usePrayerSchedule} from '@/hooks/usePrayerSchedule';
import {usePrayerLocation} from '@/hooks/usePrayerLocation';
import {colors, radius, spacing} from '@/theme';
import type {RootStackNavigationProp} from '@/types/navigation';

export default function PrayerScheduleScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {location} = usePrayerLocation();
  const {
    schedule,
    nextPrayer,
    upcomingPrayers,
    currentPrayerKey,
    countdown,
    reminders,
    isLoading,
    isRefreshing,
    isError,
    toggleReminder,
    refresh,
  } = usePrayerSchedule();

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }>
        <PrayerScheduleHeader
          nextPrayerName={nextPrayer?.item.label ?? '-'}
          nextPrayerTime={nextPrayer?.item.time ?? '--:--'}
          upcomingPrayers={upcomingPrayers}
          countdown={countdown}
          // Nama yang tampil adalah lokasi yang benar-benar dipakai menghitung
          // jadwal; lokasi hasil GPS/pengaturan hanya dipakai selagi memuat.
          location={schedule?.location.name ?? location.name}
          onPressBack={() => navigation.goBack()}
          onPressLocation={() =>
            navigation.navigate('PrayerSetting', {focus: 'location'})
          }
        />

        <View style={styles.sheet}>
          {isLoading ? <PrayerScheduleSkeleton /> : null}

          {!isLoading && isError ? (
            <View style={styles.errorState}>
              <EmptyState
                icon={DangerCircle}
                title="Jadwal sholat gagal dimuat"
                description="Periksa koneksi kamu, lalu coba lagi."
              />
              <Button label="Coba lagi" onPress={refresh} />
            </View>
          ) : null}

          {!isLoading && !isError && schedule ? (
            <PrayerSchedulePanel
              dateLabel={schedule.dateLabel}
              hijriLabel={schedule.hijriLabel}
              times={schedule.times}
              currentPrayerKey={currentPrayerKey}
              reminders={reminders}
              onToggleReminder={toggleReminder}
              onPressKiblat={() => navigation.navigate('Kiblat')}
              onPressSetting={() => navigation.navigate('PrayerSetting')}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  sheet: {
    flexGrow: 1,
    // Naik selebar sudut membulatnya saja, supaya lengkungan atas jatuh di
    // atas gradient. Yang tertutup hanya padding bawah header.
    marginTop: -spacing.lg,
    paddingTop: spacing.lg,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    backgroundColor: colors.neutral[0],
  },
  errorState: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
});
