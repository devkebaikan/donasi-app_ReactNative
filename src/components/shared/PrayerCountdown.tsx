import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {colors, fontWeight, fontSize} from '@/theme';

interface PrayerCountdownProps {
  countdown: string;
}

// Awalan "±" pada teks hitung mundur memang disengaja: waktu sholat hasil
// hisab bukan angka pasti sampai ke detik.
export function PrayerCountdown({
  countdown,
}: PrayerCountdownProps): React.JSX.Element {
  return (
    <Text
      style={styles.text}
      accessibilityLabel={`Menuju waktu berikutnya ${countdown.replace('±', 'sekitar')}`}>
      {countdown}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    color: colors.neutral[0],
  },
});
