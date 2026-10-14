import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {VolumeLoud} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, lineHeight} from '@/theme';

// Kalimat ajakan yang menjelaskan arti angka "Tersedia" di blok capaian —
// muncul tepat di atas kartu penggalang dana di DetailProgramScreen. Teksnya
// tetap (tidak datang dari API) karena berlaku untuk semua program; jangan
// dicampur dengan `program.note` yang isinya beda per program.
const AVAILABILITY_NOTE =
  'Semakin banyak donasi yang tersedia, semakin besar bantuan yang bisa disalurkan oleh gerakan ini.';

export function ProgramAvailabilityNote(): React.JSX.Element {
  return (
    <View style={styles.container} accessibilityRole="text">
      <Icon icon={VolumeLoud} size={20} color={colors.primary[600]} />
      <Text style={styles.text}>{AVAILABILITY_NOTE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primary[100],
  },
  text: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[700],
  },
});
