import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useHome } from '@/hooks/useHome';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount';
import { useAuthStore } from '@/stores/authStore';
import { useHomeBackground } from '@/hooks/useHomeBackground';
import { HomeHeader } from '@/components/shared/HomeHeader';
import { HomeBanner } from '@/components/shared/HomeBanner';
import { SaldoCard } from '@/components/shared/SaldoCard';
import { MenuUtamaGrid } from '@/components/shared/MenuUtamaGrid';
import { MenuUtamaBottomSheet } from '@/components/shared/MenuUtamaBottomSheet';
import { MainBanner } from '@/components/shared/MainBanner';
import { SecondBanner } from '@/components/shared/SecondBanner';
import { DonasiRutinCalendar } from '@/components/shared/DonasiRutinCalendar';
import { ProgramThemeSection } from '@/components/shared/ProgramThemeSection';
import { ProgramMendesakSection } from '@/components/shared/ProgramMendesakSection';
import { ProgramListSection } from '@/components/shared/ProgramListSection';
import { PopupPromo } from '@/components/shared/PopupPromo';
import { MuslimDailyCard } from '@/components/shared/MuslimDailyCard';
import { showToast } from '@/utils/toast';
import { colors, spacing } from '@/theme';
import type { MainTabNavigationProp, RootStackNavigationProp } from '@/types/navigation';
import type { Program } from '@/types/program';

const CATEGORY_CHANGE_DEBOUNCE_MS = 400;

function showComingSoon(): void {
  showToast('Segera hadir');
}

export default function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<MainTabNavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const menuSheetRef = useRef<BottomSheetModal>(null);
  const programListContainerRef = useRef<View>(null);
  const accessToken = useAuthStore(s => s.accessToken);
  const isAuthenticated = accessToken != null;
  const [displayCategoryId, setDisplayCategoryId] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);

  const {
    banners,
    mainBanner,
    secondBanner,
    menuUtama,
    donasiRutinCalendar,
    programTheme1,
    programTheme2,
    programMendesak,
    categories,
    programs,
    balance,
    nextPrayerTime,
    hijriDate,
    popupPromo,
    isPopupVisible,
    isLoading,
    isRefreshing,
    refresh,
    closePopup,
  } = useHome();
  const unreadNotificationCount = useUnreadNotificationCount();
  const { Component: BackgroundComponent } = useHomeBackground();

  const debouncedUpdateApiCategory = useDebouncedCallback(
    () => {
      refresh();
    },
    CATEGORY_CHANGE_DEBOUNCE_MS,
  );

  // useEffect(() => {
  //   if (programListContainerRef.current && scrollViewRef.current) {
  //     setTimeout(() => {
  //       const nodeHandle = findNodeHandle(programListContainerRef.current);
  //       if (nodeHandle) {
  //         UIManager.measure(
  //           nodeHandle,
  //           (_x, _y, _width, _height, _pageX, pageY) => {
  //             scrollViewRef.current?.scrollTo({ y: Math.max(0, pageY - 80), animated: true });
  //           },
  //         );
  //       }
  //     }, 100);
  //   }
  // }, [displayCategoryId]);

  function handlePressSeeMorePrograms(): void {
    navigation.navigate('Donations');
  }

  function handlePressNotification(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('Notifikasi');
  }

  function handlePressSetupRecurring(): void {
    navigation.navigate('RecurringDonation');
  }

  function handlePressSaldoAction(): void {
    if (!isAuthenticated) {
      navigation.getParent<RootStackNavigationProp>()?.navigate('Login');
    } else {
      navigation
        .getParent<RootStackNavigationProp>()
        ?.navigate('Topup', { redirectAfter: 'home' });
    }
  }

  function handlePressSearch(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('Search');
  }

  // Menu Sholat boleh dibuka tanpa login — tidak ada redirect ke Login.
  function handlePressPrayerSchedule(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('PrayerSchedule');
  }

  function handleSelectCategory(categoryId: number | null): void {
    setDisplayCategoryId(categoryId);
    debouncedUpdateApiCategory();
  }

  function handlePressProgram(program: Program): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('DetailProgram', {
      link: program.link,
    });
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>): void {
    setScrollY(event.nativeEvent.contentOffset.y);
  }

  function handlePressHomeBanner(programId: number): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('DetailProgram', { link: String(programId) });
  }

  function handlePressMainBanner(programId: number): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('DetailProgram', { link: String(programId) });
  }

  function handlePressSecondBanner(programId: number): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('DetailProgram', { link: String(programId) });
  }

  // Menu utama tinggal 4: Donasi, Infak, Zakat, Rutin. Menu ibadah (Quran,
  // Amalan, Sholat, Renungan, Doa) pindah ke section "Amalan" di AccountScreen.
  function handlePressMenuUtama(screen: string): void {
    if (screen === 'Donations') {
      navigation.navigate('Donations');
    } else if (screen === 'RecurringDonation') {
      navigation.navigate('RecurringDonation');
    } else if (screen === 'Zakat') {
      navigation.getParent<RootStackNavigationProp>()?.navigate('Zakat');
    } else if (screen === 'Infak') {
      navigation.getParent<RootStackNavigationProp>()?.navigate('Infak');
    } else {
      showComingSoon();
    }
  }

  function handlePressMoreMenu(): void {
    menuSheetRef.current?.present();
  }

  function handleSelectMenuFromSheet(screen: string): void {
    menuSheetRef.current?.dismiss();
    handlePressMenuUtama(screen);
  }

  return (
    <View style={styles.container}>
      <PopupPromo
        visible={isPopupVisible}
        promos={popupPromo || []}
        onClose={closePopup}
      />

      <BackgroundComponent>
        <View style={styles.backgroundPlaceholder} />
      </BackgroundComponent>

      <MenuUtamaBottomSheet
        ref={menuSheetRef}
        items={menuUtama}
        onSelectItem={handleSelectMenuFromSheet}
      />

      <HomeHeader
        notificationCount={isAuthenticated ? unreadNotificationCount : 0}
        onPressNotification={handlePressNotification}
        onPressSearch={handlePressSearch}
        headerBackgroundColor={scrollY > 0 ? colors.neutral[0] : undefined}
        searchBackgroundColor={scrollY > 0 ? colors.neutral[100] : colors.neutral[0]}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
          }
          style={[styles.scrollView]}>
          <View style={[styles.section, styles.transparentSection]}>
            <HomeBanner banners={banners} onPressBanner={handlePressHomeBanner} />
          </View>

          <View style={styles.gap} />

          <View style={[styles.section, { backgroundColor: colors.neutral[50] }]}>
            <SaldoCard
              balance={balance}
              nextPrayerTime={nextPrayerTime}
              hijriDate={hijriDate}
              isAuthenticated={isAuthenticated}
              onPressAction={handlePressSaldoAction}
            />
          </View>

          <View style={styles.gap} />

          <View style={styles.section}>
            <MenuUtamaGrid
              items={menuUtama}
              onPressItem={handlePressMenuUtama}
              onPressMore={handlePressMoreMenu}
            />
          </View>

          <View style={styles.gap} />

          <View style={styles.section}>
            <MainBanner
              imageUrl={mainBanner?.image_url}
              programId={mainBanner?.programId}
              onPress={handlePressMainBanner}
            />
          </View>

          <View style={styles.gap} />

          {programTheme1 && (
            <ProgramThemeSection
              thema={programTheme1}
              onPressProgram={handlePressProgram}
            />
          )}

          <View style={styles.gap} />

          {donasiRutinCalendar && (
            <>
              <View style={styles.section}>
                <DonasiRutinCalendar
                  streakDays={donasiRutinCalendar.streak_days}
                  subtitle={donasiRutinCalendar.subtitle}
                  weeklySchedule={donasiRutinCalendar.weekly_schedule}
                  onPressMore={handlePressSetupRecurring}
                />
              </View>

              <View style={styles.gap} />
            </>
          )}

          {programMendesak && (
            <ProgramMendesakSection
              thema={programMendesak}
              onPressProgram={handlePressProgram}
              cardWidth={320}
            />
          )}

          <View style={styles.gap} />

          <MuslimDailyCard
            location="Kota Surakarta"
            nextPrayerName={nextPrayerTime?.name || 'Dzuhur'}
            nextPrayerTime={nextPrayerTime?.time || '11:42'}
            quote="Semoga lelahmu menjadi berkah. Yuk, kejar berkah dengan tunaikan zakat"
            onPressDetail={handlePressPrayerSchedule}
          />

          <View style={styles.gap} />

          <View style={styles.section}>
            <SecondBanner
              imageUrl={secondBanner?.image_url}
              programId={secondBanner?.programId}
              onPress={handlePressSecondBanner}
            />
          </View>

          <View style={styles.gap} />

          {programTheme2 && (
            <ProgramThemeSection
              thema={programTheme2}
              onPressProgram={handlePressProgram}
            />
          )}

          <View style={styles.gap} />

          <View style={styles.section} ref={programListContainerRef}>
            <ProgramListSection
              programs={programs}
              categories={categories}
              selectedCategoryId={displayCategoryId}
              onSelectCategory={handleSelectCategory}
              onPressProgram={handlePressProgram}
              onPressSeeMore={handlePressSeeMorePrograms}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: colors.neutral[50],
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
  gap: {
    height: spacing.md,
    backgroundColor: colors.neutral[50],
  },
  transparentSection: {
    backgroundColor: 'transparent',
  },
});
