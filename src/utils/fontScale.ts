import {StyleSheet} from 'react-native';
import type {StyleProp, TextStyle} from 'react-native';

// Menerapkan pengali ukuran font ke sebuah style teks. Dipakai oleh
// pembungkus Text/TextInput global — lihat src/app/textScaling.tsx.
//
// Style yang TIDAK menyebut `fontSize` sengaja dibiarkan apa adanya: di React
// Native, Text bersarang mewarisi ukuran dari Text induknya. Menyuntikkan
// ukuran default ke situ justru memutus pewarisan dan membuat teks bersarang
// berukuran salah.
export function scaleTextStyle(
  style: StyleProp<TextStyle>,
  scale: number,
): StyleProp<TextStyle> {
  if (scale === 1 || style == null) {
    return style;
  }

  const flattened = StyleSheet.flatten(style);
  if (typeof flattened.fontSize !== 'number') {
    return style;
  }

  const scaled: TextStyle = {fontSize: Math.round(flattened.fontSize * scale)};

  // lineHeight ikut diskalakan dengan pengali yang sama supaya rasio jarak
  // antar baris terhadap tinggi huruf tetap seperti yang dirancang.
  if (typeof flattened.lineHeight === 'number') {
    scaled.lineHeight = Math.round(flattened.lineHeight * scale);
  }

  return [style, scaled];
}
