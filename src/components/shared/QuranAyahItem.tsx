import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import type {AccessibilityActionEvent} from 'react-native';
import {ARABIC_FONT_SCALE} from '@/stores/quranSettingStore';
import {toArabicNumber} from '@/utils/arabicNumber';
import {colors, fontFamily, spacing, fontSize, fontWeight} from '@/theme';
import type {ArabicFontSize, Ayah} from '@/types/quran';

// Ornate parentheses (U+FD3F & U+FD3E) — pembungkus nomor ayat di mushaf
// cetak. Dipakai daripada U+06DD karena rendering-nya konsisten di font mana
// pun, sedangkan U+06DD butuh dukungan font khusus.
function ayahMarker(ayahNumber: number): string {
  return `﴿${toArabicNumber(ayahNumber)}﴾`;
}

const ACTION_ACCESSIBILITY_LABEL = 'Buka pilihan ayat';

interface QuranAyahItemProps {
  ayah: Ayah;
  surahName: string;
  /** Ayat yang sedang diputar — disorot supaya mudah diikuti sambil mendengar. */
  isActive: boolean;
  onPress: (ayah: Ayah) => void;
  arabicFontSize: ArabicFontSize;
  showLatin: boolean;
  showTranslation: boolean;
  onPressActions: (ayah: Ayah) => void;
}

function QuranAyahItemComponent({
  ayah,
  surahName,
  isActive,
  onPress,
  arabicFontSize,
  showLatin,
  showTranslation,
  onPressActions,
}: QuranAyahItemProps): React.JSX.Element {
  const arabicScale = ARABIC_FONT_SCALE[arabicFontSize];

  function handleAccessibilityAction(event: AccessibilityActionEvent): void {
    if (event.nativeEvent.actionName === 'longpress') {
      onPressActions(ayah);
    }
  }

  return (
    // Tanpa tombol aksi yang selalu terlihat: ayat ditahan untuk membuka
    // pilihan bagikan/tafsir/salin. Seluruh lebar jadi milik teks, dan tidak
    // ada tinggi yang terbuang untuk kontrol yang jarang dipakai.
    <Pressable
      style={[styles.container, isActive && styles.containerActive]}
      onPress={() => onPress(ayah)}
      onLongPress={() => onPressActions(ayah)}
      delayLongPress={300}
      accessibilityRole="button"
      accessibilityLabel={`${surahName} ayat ${ayah.ayahNumber}${
        isActive ? ', sedang diputar' : ''
      }`}
      // Tekan lama tidak terlihat oleh pengguna screen reader, jadi aksinya
      // didaftarkan sebagai accessibility action dan diberi petunjuk.
      accessibilityHint="Ketuk untuk memutar ayat ini. Tahan untuk membuka pilihan bagikan, tafsir, dan salin"
      accessibilityActions={[
        {name: 'longpress', label: ACTION_ACCESSIBILITY_LABEL},
      ]}
      onAccessibilityAction={handleAccessibilityAction}>
      {({pressed}) => (
        <View style={pressed ? styles.pressed : undefined}>
          {/* Nomor ayat menyatu di ujung teks arab, bukan badge terpisah —
              seperti mushaf cetak. Karena satu Text, penandanya ikut alur RTL
              dan selalu mendarat di akhir ayat berapa pun panjangnya. */}
          <Text
            style={[
              styles.arabic,
              {
                fontSize: arabicScale.fontSize,
                lineHeight: arabicScale.lineHeight,
              },
            ]}>
            {ayah.arabic} {ayahMarker(ayah.ayahNumber)}
          </Text>

          {showLatin ? <Text style={styles.latin}>{ayah.latin}</Text> : null}

          {showTranslation ? (
            <Text style={styles.translation}>
              {ayah.ayahNumber}. {ayah.translation}
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

// Daftar ayat panjang dan tiap baris memuat teks arab besar. Tanpa memo,
// satu render ulang screen berarti seluruh baris yang terlihat digambar
// ulang — terlihat sebagai kedipan saat menggulir.
export const QuranAyahItem = React.memo(QuranAyahItemComponent);

const styles = StyleSheet.create({
  // Sorotan ayat yang sedang diputar. Warna paling muda dari skala primary —
  // cukup untuk menandai baris tanpa melawan keterbacaan teks arab di atasnya.
  containerActive: {
    backgroundColor: colors.primary[50],
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    // Garis penutup tiap ayat. Setipis mungkin (hairline) supaya menandai
    // batas tanpa ikut menarik perhatian dari teksnya.
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
  },
  // Umpan balik saat ditahan — tanpa ini tekan lama terasa seperti tidak
  // terjadi apa-apa sampai bottom sheet muncul.
  pressed: {
    opacity: 0.6,
  },
  arabic: {
    fontFamily: fontFamily.arabic,
    color: colors.neutral[900],
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: spacing.sm,
  },
  // Lafal latin: tebal-miring, membedakannya dari terjemahan di bawahnya
  // tanpa perlu warna atau ukuran yang berbeda jauh.
  latin: {
    fontSize: fontSize.md,
    fontStyle: 'italic',
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[700],
    lineHeight: fontSize.md * 1.6,
    marginBottom: spacing.sm,
  },
  translation: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.neutral[800],
    lineHeight: fontSize.md * 1.6,
  },
});
