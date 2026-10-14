import AsyncStorage from '@react-native-async-storage/async-storage';

// Teks mushaf, terjemahan, dan tafsir IKUT DI-BUNDLE dalam aplikasi
// (ADR-003), jadi tidak ada yang bisa dibebaskan dari situ. Yang benar-benar
// tersimpan di perangkat dan bisa dihapus hanya jejak pemakaian: posisi baca
// terakhir per surah dan riwayat pencarian.
const QURAN_DATA_KEYS = ['quran-reading-storage', 'quran-search-storage'];

// Ukuran perkiraan dari panjang JSON yang tersimpan — AsyncStorage tidak
// menyediakan ukuran sebenarnya di disk, dan selisihnya tidak berarti pada
// data sekecil ini.
export async function getQuranLocalDataSize(): Promise<number> {
  const entries = await AsyncStorage.getMany(QURAN_DATA_KEYS);
  return Object.values(entries).reduce(
    (total, value) => total + (value?.length ?? 0),
    0,
  );
}

// Dihapus dari disk secara eksplisit, bukan hanya diandalkan pada tulisan
// balik zustand persist: penulisan itu asinkron, dan tanpa penghapusan yang
// ditunggu, ukuran yang dibaca ulang sesudahnya bisa masih ukuran lama.
export async function clearQuranLocalData(): Promise<void> {
  await AsyncStorage.removeMany(QURAN_DATA_KEYS);
}
