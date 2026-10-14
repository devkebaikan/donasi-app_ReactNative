import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AltArrowDown } from '@solar-icons/react-native/Linear';
import { Icon } from '@/components/ui/Icon';
import { ProgramProgressBar } from '@/components/shared/ProgramProgressBar';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDaysLeftValue } from '@/utils/donationProgress';
import { colors, spacing, radius, fontSize, fontWeight, lineHeight } from '@/theme';
import type { ProgramDetail } from '@/types/programDetail';

interface ProgramInfoCapaianProps {
  program: ProgramDetail;
  /** Blok yang ikut muncul/hilang bersama "Selengkapnya", dirender full-bleed
   * di bawah blok capaian (di luar padding container ini) — dipakai
   * DetailProgramScreen untuk "Project Salur Terdekat". */
  expandedContent?: React.ReactNode;
}

// Saat tertutup, blok ini cuma menampilkan judul program + nominal tersedia.
// Semua rincian capaian (nominal tercapai/target, bar progres, jumlah donatur,
// sisa waktu) dan `expandedContent` baru muncul setelah "Selengkapnya"
// ditekan.
export function ProgramInfoCapaian({
  program,
  expandedContent,
}: ProgramInfoCapaianProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  const isGoalUnlimited = !Number.isFinite(program.goalAmount);
  const isTimeUnlimited = !Number.isFinite(program.daysLeft);

  return (
    <View>
      <View style={styles.container}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {program.title}
        </Text>

        <View style={styles.availableRow}>
          <View style={styles.availableText}>
            <Text style={styles.label}>Tersedia</Text>
            <Text style={styles.availableAmount}>
              {formatCurrency(program.availableAmount)}
            </Text>
          </View>
          {/* Panah saja tidak cukup menjelaskan apa yang akan terbuka —
              labelnya ikut berganti mengikuti keadaan tombol. */}
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsExpanded(previous => !previous)}
            accessibilityRole="button"
            accessibilityLabel={
              isExpanded ? 'Sembunyikan detail capaian' : 'Lihat detail capaian'
            }
            accessibilityState={{ expanded: isExpanded }}>
            <Text style={styles.expandLabel}>
              {isExpanded ? 'Sembunyikan' : 'Selengkapnya'}
            </Text>
            <View style={isExpanded ? styles.chevronExpanded : undefined}>
              <Icon icon={AltArrowDown} size={18} color={colors.neutral[500]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Urutan isi: bar progres -> jumlah donatur & sisa waktu -> kartu
            nominal tercapai/target -> `expandedContent` (Project Salur
            Terdekat) di bawah, full-bleed. */}
        {isExpanded ? (
          <>
            <ProgramProgressBar progress={program.progressPercent} />

            <View style={styles.statsRow}>
              <Text style={styles.statsText}>
                {`${program.donaturCount.toLocaleString('id-ID')} orang ber${program.donationLabel.toLowerCase()}`}
              </Text>
              <Text style={styles.statsText}>
                {formatDaysLeftValue(program.daysLeft)}
                {isTimeUnlimited ? '' : ' hari lagi'}
              </Text>
            </View>

            <View style={styles.expandedArea}>
              <View style={styles.expandedRow}>
                <Text style={styles.label}>Nominal tercapai</Text>
                <Text style={styles.expandedValue}>
                  {formatCurrency(program.collectedAmount)}
                </Text>
              </View>
              <View style={styles.expandedRow}>
                <Text style={styles.label}>Nominal target</Text>
                <Text style={styles.expandedValue}>
                  {isGoalUnlimited
                    ? 'Tanpa target'
                    : formatCurrency(program.goalAmount)}
                </Text>
              </View>
            </View>
          </>
        ) : null}

        {program.note ? <Text style={styles.note}>{program.note}</Text> : null}
      </View>

      {isExpanded ? expandedContent : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  availableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availableText: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.neutral[500],
  },
  availableAmount: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingLeft: spacing.sm,
  },
  expandLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  expandedArea: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[50],
    gap: spacing.sm,
  },
  expandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expandedValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsText: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  note: {
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
    color: colors.neutral[500],
  },
});
