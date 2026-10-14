import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import {AltArrowDown, AltArrowUp} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {ProgramProgressBar} from '@/components/shared/ProgramProgressBar';
import {formatCompactCurrency} from '@/utils/formatCurrency';
import {formatDate} from '@/utils/formatDate';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {DistributionProgramReport} from '@/types/impact';

interface DistributionProgramCardProps {
  program: DistributionProgramReport;
  isExpanded: boolean;
  onToggle: (programId: string) => void;
}

// Kartu laporan satu program. TIDAK bisa ditekan untuk pindah screen — ini
// laporan, bukan pintu ke halaman program, dan `id`-nya bukan `programId` yang
// dipakai DetailProgram.
//
// Tidak memakai FaqAccordionItem karena isinya bukan pasangan tanya-jawab,
// tapi pola buka-tutupnya disalin dari sana.
export function DistributionProgramCard({
  program,
  isExpanded,
  onToggle,
}: DistributionProgramCardProps): React.JSX.Element {
  // Chevron TIDAK dirender saat tidak ada rincian: chevron yang membuka ruang
  // kosong lebih membingungkan daripada tidak ada chevron.
  const canExpand = program.details.length > 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => onToggle(program.id)}
        disabled={!canExpand}
        accessibilityRole="button"
        accessibilityState={{expanded: canExpand ? isExpanded : undefined}}
        accessibilityLabel={
          canExpand
            ? `${program.title}. Ketuk untuk melihat rincian penyaluran`
            : program.title
        }>
        <Text style={styles.title} numberOfLines={2}>
          {program.title}
        </Text>
        {canExpand ? (
          <Icon
            icon={isExpanded ? AltArrowUp : AltArrowDown}
            size={22}
            color={colors.neutral[400]}
          />
        ) : null}
      </TouchableOpacity>

      {/* Pill menggulir mendatar kalau melebihi lebar — tidak dipotong
          ellipsis dan tidak dibungkus ke baris kedua. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagRow}>
        {program.categoryLabels.map(label => (
          <View key={label} style={styles.tag}>
            <Text style={styles.tagText}>{label}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Dana Terkumpul</Text>
        <Text style={styles.amountValue}>
          {formatCompactCurrency(program.collectedAmount)}
        </Text>
      </View>
      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Dana Tersalurkan</Text>
        <Text
          style={[
            styles.amountValue,
            program.distributedAmount > 0
              ? styles.distributedPositive
              : styles.distributedZero,
          ]}>
          {formatCompactCurrency(program.distributedAmount)}
        </Text>
      </View>

      {/* Persentase datang jadi dari API — jangan dihitung ulang di sini. */}
      <ProgramProgressBar progress={program.distributionPercentage} />
      <Text style={styles.progressLabel}>
        {program.distributionPercentage}% Tersalurkan
      </Text>

      {canExpand && isExpanded ? (
        <View style={styles.details}>
          <Text style={styles.detailsTitle}>Rincian Penyaluran</Text>
          {program.details.map(detail => (
            <View key={`${detail.label}-${detail.date}`} style={styles.detailRow}>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>{detail.label}</Text>
                <Text style={styles.detailDate}>{formatDate(detail.date)}</Text>
              </View>
              <Text style={styles.detailAmount}>
                {formatCompactCurrency(detail.amount)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
    gap: spacing.sm,
    // Alasan yang sama dengan kartu ringkasan: latar neutral[50] nyaru dengan
    // latar bergradient screen ini. Di Donasi Bersama kartu serupa tidak
    // butuh border karena latarnya putih polos.
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
  },
  title: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  tagRow: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.primary[50],
  },
  tagText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.primary[700],
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  amountValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  distributedPositive: {
    color: colors.semantic.success,
  },
  distributedZero: {
    color: colors.neutral[500],
  },
  progressLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  details: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    gap: spacing.sm,
  },
  detailsTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[700],
  },
  detailDate: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
  },
  detailAmount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
});
