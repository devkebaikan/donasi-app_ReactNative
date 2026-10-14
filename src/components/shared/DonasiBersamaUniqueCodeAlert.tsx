import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {InfoCircle} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight, lineHeight} from '@/theme';

// Teks tetap, bukan hasil perhitungan — nominal final beserta kode uniknya
// baru terlihat di PaymentInvoice. Struktur ditiru dari ProjectSalurInfoAlert
// yang props-nya terikat program, jadi tidak bisa dipakai langsung.
export function DonasiBersamaUniqueCodeAlert(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Icon icon={InfoCircle} size={18} color={colors.primary[600]} />
      <Text style={styles.text}>
        <Text style={styles.strong}>Penting: </Text>
        Transfer hingga 3 digit terakhir (Kode Unik) agar urunan otomatis masuk
        grup tanpa verifikasi manual.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primary[50],
  },
  text: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[700],
  },
  strong: {
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
});
