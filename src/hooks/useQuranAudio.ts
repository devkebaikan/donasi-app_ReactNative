import {useCallback, useEffect, useState} from 'react';
import {useQuranSettingStore} from '@/stores/quranSettingStore';
import {getAyahAudioUrl, getSurahAudioUrl} from '@/utils/quranAudio';
import {showToast} from '@/utils/toast';

interface UseQuranAudioParams {
  surahNumber: number;
  totalAyah: number;
  /** Ayat awal saat reader dibuka. */
  initialAyah: number;
  /** Dipanggil tiap ayat aktif berubah, supaya daftar ikut ter-scroll. */
  onActiveAyahChange: (ayahNumber: number) => void;
}

export type QuranAudioMode = 'ayah' | 'surah';

type State = {
  mode: QuranAudioMode;
  activeAyah: number;
  /** Detik berjalan & total, hanya terisi saat memutar satu surah penuh. */
  elapsedSeconds: number;
  durationSeconds: number;
  isPlaying: boolean;
  isMuted: boolean;
  isRepeatingAyah: boolean;
  audioUrl: string;
  hasPreviousAyah: boolean;
  hasNextAyah: boolean;
};

type Actions = {
  toggle: () => void;
  toggleMute: () => void;
  toggleRepeatAyah: () => void;
  playAyah: (ayahNumber: number) => void;
  playFullSurah: () => void;
  stop: () => void;
  handleLoad: (data: {duration: number}) => void;
  handleProgress: (data: {currentTime: number}) => void;
  goToPreviousAyah: () => void;
  goToNextAyah: () => void;
  handleAudioEnd: () => void;
  handleAudioError: () => void;
};

export function useQuranAudio({
  surahNumber,
  totalAyah,
  initialAyah,
  onActiveAyahChange,
}: UseQuranAudioParams): State & Actions {
  const qari = useQuranSettingStore(s => s.qari);
  const [activeAyah, setActiveAyah] = useState(initialAyah);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  // Ulangi satu ayat — kebutuhan pokok saat menghafal.
  const [isRepeatingAyah, setIsRepeatingAyah] = useState(false);
  const [mode, setMode] = useState<QuranAudioMode>('ayah');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);

  // Pindah surah: audio berhenti dan penanda kembali ke ayat awal, supaya
  // tidak ada bacaan surah lama yang terus berbunyi di halaman baru.
  useEffect(() => {
    setIsPlaying(false);
    setActiveAyah(initialAyah);
    setMode('ayah');
    setElapsedSeconds(0);
    setDurationSeconds(0);
  }, [surahNumber, initialAyah]);

  const moveTo = useCallback(
    (ayahNumber: number): void => {
      const clamped = Math.min(Math.max(1, ayahNumber), totalAyah);
      // Berpindah ayat selalu mengembalikan ke mode per-ayat: memutar satu
      // surah penuh tidak punya arti "pindah ke ayat" karena berkasnya satu.
      setMode('ayah');
      setActiveAyah(clamped);
      onActiveAyahChange(clamped);
    },
    [onActiveAyahChange, totalAyah],
  );

  return {
    mode,
    activeAyah,
    elapsedSeconds,
    durationSeconds,
    isPlaying,
    isMuted,
    isRepeatingAyah,
    audioUrl:
      mode === 'surah'
        ? getSurahAudioUrl(surahNumber, qari)
        : getAyahAudioUrl(surahNumber, activeAyah, qari),
    hasPreviousAyah: activeAyah > 1,
    hasNextAyah: activeAyah < totalAyah,

    // Menekan putar juga membawa ayat aktif ke layar. Tanpa ini, sorotan
    // memang muncul di ayat yang benar tapi bisa berada jauh di luar
    // pandangan kalau daftar sedang di-scroll ke tempat lain — terlihat
    // seperti tidak ada yang tersorot sama sekali.
    toggle: () => {
      const willPlay = !isPlaying;
      setIsPlaying(willPlay);
      if (willPlay) {
        onActiveAyahChange(activeAyah);
      }
    },
    toggleMute: () => setIsMuted(current => !current),
    toggleRepeatAyah: () => setIsRepeatingAyah(current => !current),

    // Lompat ke ayat tertentu lalu langsung putar — dipakai saat ayat ditekan
    // dan saat memilih dari daftar lompat ayat.
    playAyah: (ayahNumber: number) => {
      moveTo(ayahNumber);
      setIsPlaying(true);
    },

    playFullSurah: () => {
      setMode('surah');
      setElapsedSeconds(0);
      setDurationSeconds(0);
      setIsPlaying(true);
    },

    handleLoad: ({duration}: {duration: number}) => setDurationSeconds(duration),
    // onProgress berdetak ~4x/detik. Waktu hanya ditampilkan pada mode satu
    // surah, jadi di mode per-ayat state-nya sengaja tidak disentuh — kalau
    // tidak, seluruh layar render ulang empat kali sedetik tanpa guna.
    handleProgress: ({currentTime}: {currentTime: number}) => {
      if (mode !== 'surah') {
        return;
      }
      setElapsedSeconds(currentTime);
    },

    stop: () => setIsPlaying(false),
    goToPreviousAyah: () => moveTo(activeAyah - 1),
    goToNextAyah: () => moveTo(activeAyah + 1),

    // Selesai satu ayat: lanjut sendiri ke ayat berikutnya supaya bisa
    // didengarkan menerus. Di ayat terakhir berhenti — pindah surah tetap
    // keputusan pengguna, bukan otomatis.
    handleAudioEnd: () => {
      // Mode ulangi ditangani prop `repeat` milik pemutar (looping native).
      // Sebagian platform tetap memicu onEnd, jadi dijaga di sini juga.
      if (isRepeatingAyah) {
        return;
      }
      // Satu surah penuh selesai: berhenti, tidak ada ayat berikutnya.
      if (mode === 'surah') {
        setIsPlaying(false);
        return;
      }
      if (activeAyah >= totalAyah) {
        setIsPlaying(false);
        return;
      }
      moveTo(activeAyah + 1);
    },

    // Audio streaming; kegagalan paling sering karena koneksi. Hentikan
    // pemutaran supaya tombol tidak terlihat "sedang berjalan" padahal diam.
    handleAudioError: () => {
      setIsPlaying(false);
      showToast('Tidak dapat memutar audio.');
    },
  };
}
