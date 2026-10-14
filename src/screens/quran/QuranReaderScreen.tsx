import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, Text, FlatList, Share, StyleSheet} from 'react-native';
import type {ViewToken} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import Clipboard from '@react-native-clipboard/clipboard';
import Video from 'react-native-video';
import {EmptyState} from '@/components/ui/EmptyState';
import {Button} from '@/components/ui/Button';
import {BookBookmark} from '@solar-icons/react-native/Linear';
import {QuranReaderHeader} from '@/components/shared/QuranReaderHeader';
import {QuranAyahItem} from '@/components/shared/QuranAyahItem';
import {QuranAyahActionSheet} from '@/components/shared/QuranAyahActionSheet';
import {QuranTafsirSheet} from '@/components/shared/QuranTafsirSheet';
import {QuranGoToSheet} from '@/components/shared/QuranGoToSheet';
import {QuranSurahNavFooter} from '@/components/shared/QuranSurahNavFooter';
import {QuranAudioBar} from '@/components/shared/QuranAudioBar';
import {QuranAyahJumpSheet} from '@/components/shared/QuranAyahJumpSheet';
import {QuranQariSheet} from '@/components/shared/QuranQariSheet';
import {useQuranReader} from '@/hooks/useQuranReader';
import {useQuranAudio} from '@/hooks/useQuranAudio';
import {useQuranSettingStore} from '@/stores/quranSettingStore';
import {getQariLabel} from '@/utils/quranAudio';
import {showToast} from '@/utils/toast';
import type {RootStackNavigationProp, RootStackParamList} from '@/types/navigation';
import type {Ayah} from '@/types/quran';
import {colors, fontFamily, spacing, fontSize, fontWeight} from '@/theme';

const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

// Ayat dihitung terbaca saat 60% tingginya masuk viewport — cukup longgar
// untuk scroll cepat, cukup ketat supaya ayat yang cuma lewat tidak dihitung.
const VIEWABILITY_CONFIG = {itemVisiblePercentThreshold: 60};

const INITIAL_RENDER_COUNT = 15;
// Perkiraan tinggi satu blok ayat (arab + lafal + terjemahan), dipakai hanya
// sebagai cadangan saat tinggi sebenarnya belum terukur.
const ESTIMATED_AYAH_HEIGHT = 220;
const MAX_SCROLL_RETRY = 2;

function keyExtractor(ayah: Ayah): string {
  return String(ayah.ayahNumber);
}

function QuranReaderScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'QuranReader'>>();
  const listRef = useRef<FlatList<Ayah>>(null);
  const actionSheetRef = useRef<BottomSheetModal>(null);
  const tafsirSheetRef = useRef<BottomSheetModal>(null);
  const goToSheetRef = useRef<BottomSheetModal>(null);
  const ayahJumpSheetRef = useRef<BottomSheetModal>(null);
  const qariSheetRef = useRef<BottomSheetModal>(null);

  const qari = useQuranSettingStore(s => s.qari);
  const setQari = useQuranSettingStore(s => s.setQari);

  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);

  // Koreksi gulir yang tertunda disimpan supaya bisa dibatalkan. Tanpa ini,
  // tiap perpindahan ayat menumpuk timer baru dan semuanya menarik daftar ke
  // posisi berbeda-beda — itulah yang terlihat sebagai gulir naik-turun cepat.
  const correctionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRetryRef = useRef(0);

  const cancelPendingScroll = useCallback((): void => {
    if (correctionTimerRef.current) {
      clearTimeout(correctionTimerRef.current);
      correctionTimerRef.current = null;
    }
  }, []);

  // Batalkan koreksi yang masih tertunda saat komponen dilepas.
  useEffect(() => cancelPendingScroll, [cancelPendingScroll]);

  // Ayat yang sedang diputar ikut men-scroll daftar, supaya yang terdengar
  // adalah yang terlihat.
  const scrollToAyah = useCallback(
    (ayahNumber: number): void => {
      const index = Math.max(0, ayahNumber - 1);
      cancelPendingScroll();
      scrollRetryRef.current = 0;

      // viewPosition 0 = tepi atas ayat menempel ke tepi atas daftar.
      listRef.current?.scrollToIndex({index, viewPosition: 0, animated: true});

      // Satu kali koreksi setelah ayatnya benar-benar terukur. Hanya satu,
      // dan dibatalkan begitu ada gulir baru atau sentuhan pengguna.
      correctionTimerRef.current = setTimeout(() => {
        correctionTimerRef.current = null;
        listRef.current?.scrollToIndex({
          index,
          viewPosition: 0,
          animated: false,
        });
      }, 350);
    },
    [cancelPendingScroll],
  );

  const {
    surah,
    ayahs,
    isPlaceholderData,
    hasContent,
    initialAyah,
    subtitle,
    showBismillah,
    isSaved,
    previousSurah,
    nextSurah,
    arabicFontSize,
    showLatin,
    showTranslation,
    handleAyahVisible,
    toggleBookmark,
    getTafsirText,
    flushProgress,
  } = useQuranReader({
    surahNumber: route.params.surahNumber,
    ayahNumber: route.params.ayahNumber,
  });

  const surahName = surah?.nameLatin ?? 'Surah';
  const ayahLabel = selectedAyah
    ? `QS. ${surahName}: ${selectedAyah.ayahNumber}`
    : '';

  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      const first = viewableItems[0]?.item as Ayah | undefined;
      if (first) {
        handleAyahVisibleRef.current(first.ayahNumber);
      }
    },
  ).current;

  // Callback viewability tidak boleh berganti identitas setelah FlatList
  // ter-mount — RN melempar error kalau berubah. Ref-nya yang diperbarui.
  const handleAyahVisibleRef = useRef(handleAyahVisible);
  handleAyahVisibleRef.current = handleAyahVisible;

  function handleScrollToIndexFailed(info: {
    index: number;
    averageItemLength: number;
  }): void {
    // Percobaan ulang DIBATASI. Kalau scrollToIndex gagal lagi, handler ini
    // terpanggil lagi dan menjadwalkan percobaan berikutnya — tanpa batas
    // itu berubah jadi lingkaran tak berujung yang menarik daftar tiap
    // beberapa ratus milidetik.
    if (scrollRetryRef.current >= MAX_SCROLL_RETRY) {
      return;
    }
    scrollRetryRef.current += 1;

    // averageItemLength bisa 0 saat mount pertama karena belum ada satu pun
    // ayat yang selesai diukur. Perkiraan tinggi dipakai sebagai lantai.
    const itemHeight = info.averageItemLength || ESTIMATED_AYAH_HEIGHT;
    listRef.current?.scrollToOffset({
      offset: itemHeight * info.index,
      animated: false,
    });

    cancelPendingScroll();
    correctionTimerRef.current = setTimeout(() => {
      correctionTimerRef.current = null;
      listRef.current?.scrollToIndex({
        index: info.index,
        viewPosition: 0,
        animated: false,
      });
    }, 300);
  }

  const audio = useQuranAudio({
    surahNumber: route.params.surahNumber,
    totalAyah: surah?.totalAyah ?? 0,
    initialAyah,
    onActiveAyahChange: scrollToAyah,
  });

  function handleBack(): void {
    audio.stop();
    flushProgress();
    navigation.goBack();
  }

  function goToSurah(surahNumber: number, ayahNumber: number): void {
    audio.stop();
    flushProgress();
    goToSheetRef.current?.dismiss();
    navigation.replace('QuranReader', {surahNumber, ayahNumber});
  }

  // Dikirim ke QuranAyahItem yang ber-memo. Kalau identitasnya berubah tiap
  // render, memo-nya percuma dan semua baris tetap digambar ulang.
  const playAyah = audio.playAyah;
  const handlePressAyah = useCallback(
    (ayah: Ayah): void => {
      playAyah(ayah.ayahNumber);
    },
    [playAyah],
  );

  function handleJumpToAyah(ayahNumber: number): void {
    ayahJumpSheetRef.current?.dismiss();
    audio.playAyah(ayahNumber);
  }

  const handlePressAyahActions = useCallback((ayah: Ayah): void => {
    setSelectedAyah(ayah);
    actionSheetRef.current?.present();
  }, []);

  function buildAyahText(ayah: Ayah): string {
    const lines = [ayah.arabic];
    if (showLatin) {
      lines.push(ayah.latin);
    }
    if (showTranslation) {
      lines.push(ayah.translation);
    }
    lines.push(`(QS. ${surahName}: ${ayah.ayahNumber})`);
    return lines.join('\n\n');
  }

  async function handleShareAyah(): Promise<void> {
    if (!selectedAyah) {
      return;
    }
    actionSheetRef.current?.dismiss();
    try {
      await Share.share({message: buildAyahText(selectedAyah)});
    } catch {
      showToast('Tidak dapat membagikan ayat.');
    }
  }

  function handleCopyAyah(): void {
    if (!selectedAyah) {
      return;
    }
    actionSheetRef.current?.dismiss();
    Clipboard.setString(buildAyahText(selectedAyah));
    showToast('Teks ayat disalin');
  }

  function handleOpenTafsir(): void {
    actionSheetRef.current?.dismiss();
    tafsirSheetRef.current?.present();
  }

  async function handleShareSurah(): Promise<void> {
    try {
      await Share.share({
        message: `Yuk baca Surah ${surahName} bersama-sama.`,
      });
    } catch {
      showToast('Tidak dapat membagikan surah.');
    }
  }

  // Dibungkus useCallback supaya FlatList tidak menerima fungsi baru tiap
  // render, yang membuatnya menganggap seluruh baris perlu digambar ulang.
  // Objek source baru tiap render membuat pemutar menganggap berkasnya
  // berganti, lalu memuat ulang — terdengar sebagai audio tersendat.
  const audioSource = useMemo(
    () => ({uri: audio.audioUrl}),
    [audio.audioUrl],
  );

  const renderAyah = useCallback(
    ({item}: {item: Ayah}): React.JSX.Element => (
      <QuranAyahItem
        ayah={item}
        surahName={surahName}
        isActive={item.ayahNumber === audio.activeAyah}
        onPress={handlePressAyah}
        arabicFontSize={arabicFontSize}
        showLatin={showLatin}
        showTranslation={showTranslation}
        onPressActions={handlePressAyahActions}
      />
    ),
    [
      surahName,
      audio.activeAyah,
      arabicFontSize,
      showLatin,
      showTranslation,
      handlePressAyah,
      handlePressAyahActions,
    ],
  );

  const renderHeader = useCallback((): React.JSX.Element | null => {
    if (!showBismillah) {
      return null;
    }
    return (
      <View style={styles.bismillahBlock}>
        <Text
          style={styles.bismillah}
          accessibilityLabel="Bismillahirrahmanirrahim">
          {BISMILLAH}
        </Text>
      </View>
    );
  }, [showBismillah]);

  if (!hasContent) {
    return (
      <View style={styles.container}>
        <QuranReaderHeader
          surahName={surahName}
          subtitle={subtitle}
          isSaved={isSaved}
          onBack={handleBack}
          isPlayingFullSurah={audio.mode === 'surah' && audio.isPlaying}
        qariLabel={getQariLabel(qari)}
        onPressQari={() => qariSheetRef.current?.present()}
        onPressPlayFullSurah={audio.playFullSurah}
        onPressGoTo={() => goToSheetRef.current?.present()}
          onPressSave={toggleBookmark}
          onPressShare={handleShareSurah}
        />
        <View style={styles.errorState}>
          <EmptyState
            icon={BookBookmark}
            title="Data Quran gagal dimuat"
            description="Teks surah ini tidak dapat dibaca dari perangkat."
          />
          <Button label="Coba Lagi" variant="secondary" onPress={handleBack} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <QuranReaderHeader
        surahName={surahName}
        subtitle={subtitle}
        isSaved={isSaved}
        onBack={handleBack}
        isPlayingFullSurah={audio.mode === 'surah' && audio.isPlaying}
        qariLabel={getQariLabel(qari)}
        onPressQari={() => qariSheetRef.current?.present()}
        onPressPlayFullSurah={audio.playFullSurah}
        onPressGoTo={() => goToSheetRef.current?.present()}
        onPressSave={toggleBookmark}
        onPressShare={handleShareSurah}
      />

      {isPlaceholderData ? (
        <Text style={styles.placeholderNotice}>
          Teks mushaf belum dimuat — isi ayat masih placeholder.
        </Text>
      ) : null}

      <FlatList
        ref={listRef}
        data={ayahs}
        keyExtractor={keyExtractor}
        // FlatList, bukan ScrollView: Al-Baqarah 286 ayat dan tiap item
        // berisi tiga blok teks panjang.
        initialScrollIndex={Math.max(0, initialAyah - 1)}
        // Ayat tujuan harus ikut ter-render di batch pertama, kalau tidak
        // posisinya belum terukur dan initialScrollIndex gagal.
        initialNumToRender={Math.max(INITIAL_RENDER_COUNT, initialAyah)}
        // Tinggi ayat bervariasi, jadi FlatList kadang belum tahu offset
        // target saat mount pertama. Ditelan diam-diam berarti posisi baca
        // gagal di-restore tanpa jejak — jadi dicoba ulang setelah daftar
        // sempat terpasang.
        onScrollToIndexFailed={handleScrollToIndexFailed}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          <QuranSurahNavFooter
            previousName={previousSurah?.nameLatin ?? null}
            nextName={nextSurah?.nameLatin ?? null}
            onPressPrevious={() =>
              previousSurah && goToSurah(previousSurah.number, 1)
            }
            onPressNext={() => nextSurah && goToSurah(nextSurah.number, 1)}
          />
        }
        // Tanpa extraData, baris tidak dirender ulang saat ayat aktif
        // berpindah sehingga sorotannya tidak ikut berpindah.
        // Begitu pengguna menggulir sendiri, koreksi yang tertunda dibatalkan
        // — kalau tidak, daftar tersentak balik ke posisi lama saat dibaca.
        onScrollBeginDrag={cancelPendingScroll}
        extraData={audio.activeAyah}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onViewableItemsChanged={onViewableItemsChanged}
        showsVerticalScrollIndicator={false}
        renderItem={renderAyah}
      />

      {/* Tanpa ukuran: react-native-video dipakai murni sebagai pemutar
          audio, tidak ada yang perlu ditampilkan. */}
      <Video
        source={audioSource}
        paused={!audio.isPlaying}
        muted={audio.isMuted}
        repeat={audio.isRepeatingAyah}
        onLoad={audio.handleLoad}
        onProgress={audio.handleProgress}
        onEnd={audio.handleAudioEnd}
        onError={audio.handleAudioError}
        style={styles.audioPlayer}
        ignoreSilentSwitch="ignore"
      />

      <QuranAudioBar
        mode={audio.mode}
        elapsedSeconds={audio.elapsedSeconds}
        durationSeconds={audio.durationSeconds}
        activeAyah={audio.activeAyah}
        totalAyah={surah?.totalAyah ?? 0}
        isPlaying={audio.isPlaying}
        isMuted={audio.isMuted}
        isRepeatingAyah={audio.isRepeatingAyah}
        hasPreviousAyah={audio.hasPreviousAyah}
        hasNextAyah={audio.hasNextAyah}
        hasPreviousSurah={previousSurah != null}
        hasNextSurah={nextSurah != null}
        onToggle={audio.toggle}
        onToggleMute={audio.toggleMute}
        onToggleRepeatAyah={audio.toggleRepeatAyah}
        onPressProgress={() => ayahJumpSheetRef.current?.present()}
        onPreviousAyah={audio.goToPreviousAyah}
        onNextAyah={audio.goToNextAyah}
        onPreviousSurah={() =>
          previousSurah && goToSurah(previousSurah.number, 1)
        }
        onNextSurah={() => nextSurah && goToSurah(nextSurah.number, 1)}
      />

      <QuranAyahActionSheet
        ref={actionSheetRef}
        ayahLabel={ayahLabel}
        onPressShare={handleShareAyah}
        onPressTafsir={handleOpenTafsir}
        onPressCopy={handleCopyAyah}
      />

      <QuranTafsirSheet
        ref={tafsirSheetRef}
        title={`Tafsir ${ayahLabel}`}
        content={selectedAyah ? getTafsirText(selectedAyah.ayahNumber) : null}
      />

      <QuranQariSheet
        ref={qariSheetRef}
        value={qari}
        onSelect={selected => {
          setQari(selected);
          qariSheetRef.current?.dismiss();
        }}
      />

      <QuranAyahJumpSheet
        ref={ayahJumpSheetRef}
        surahName={surahName}
        totalAyah={surah?.totalAyah ?? 0}
        activeAyah={audio.activeAyah}
        onSelect={handleJumpToAyah}
      />

      <QuranGoToSheet
        ref={goToSheetRef}
        currentSurahNumber={route.params.surahNumber}
        onOpen={goToSurah}
      />
    </View>
  );
}

export default QuranReaderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  bismillahBlock: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  bismillah: {
    fontFamily: fontFamily.arabic,
    fontSize: 26,
    lineHeight: 52,
    color: colors.primary[700],
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  placeholderNotice: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.semantic.warningLight,
    color: colors.semantic.warning,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  audioPlayer: {
    width: 0,
    height: 0,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});
