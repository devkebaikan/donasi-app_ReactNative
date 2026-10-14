import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {formatCompactCurrency} from '@/utils/formatCurrency';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {DistributionSummary} from '@/types/impact';

interface DistributionSummaryCardsProps {
  summary: DistributionSummary;
}

// Empat kartu ringkasan periode, dua per baris. Mengikuti pola kartu angka
// yang sudah ada di ProjectSalurAmountCards: View berlatar tint dengan nominal
// berwarna, BUKAN LinearGradient berteks putih.
//
// Versi gradient sempat dipakai dan nominalnya terpotong keluar kotak. Pola di
// sini juga membuat nominal tetap terbaca saat panjangnya berubah — "Rp 45,3
// Ribu" dan "Rp 15,2 Juta" tidak sama lebarnya.
//
// TIDAK ikut berubah saat chip kategori diganti: ini angka periode, bukan
// angka kategori.
export function DistributionSummaryCards({
  summary,
}: DistributionSummaryCardsProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.card, styles.incomingCard]}>
          <Text style={[styles.label, styles.incomingLabel]}>Dana Masuk</Text>
          <Text style={[styles.value, styles.incomingValue]}>
            {formatCompactCurrency(summary.incomingAmount)}
          </Text>
        </View>
        <View style={[styles.card, styles.distributedCard]}>
          <Text style={[styles.label, styles.distributedLabel]}>
            Tersalurkan
          </Text>
          <Text style={[styles.value, styles.distributedValue]}>
            {formatCompactCurrency(summary.distributedAmount)}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.plainCard]}>
          <Text style={styles.label}>Sisa Dana</Text>
          <Text style={[styles.value, styles.remainingValue]}>
            {formatCompactCurrency(summary.remainingAmount)}
          </Text>
        </View>
        <View style={[styles.card, styles.plainCard]}>
          <Text style={styles.label}>Biaya Operasional</Text>
          <Text style={styles.value}>
            {formatCompactCurrency(summary.operationalAmount)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
    // Border wajib: kartu ini duduk di atas latar bergradient terang, dan
    // latar tint-nya sendiri terlalu dekat dengan warna latar itu sehingga
    // kartunya nyaru. Warnanya netral untuk keempat kartu supaya bobot
    // garisnya seragam — pembedanya tetap warna latar dan nominalnya.
    // Sama dengan border ReportPeriodRow di screen yang sama.
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  incomingCard: {
    backgroundColor: colors.primary[50],
  },
  distributedCard: {
    backgroundColor: colors.primary[100],
  },
  plainCard: {
    backgroundColor: colors.neutral[50],
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  incomingLabel: {
    color: colors.semantic.success,
  },
  distributedLabel: {
    color: colors.primary[600],
  },
  value: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  incomingValue: {
    color: colors.semantic.success,
  },
  distributedValue: {
    color: colors.primary[700],
  },
  remainingValue: {
    color: colors.semantic.error,
  },
});
