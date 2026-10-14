import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {AltArrowRight, MenuDots} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {formatDate} from '@/utils/formatDate';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {
  DonasiBersamaBatch,
  DonasiBersamaBatchStatus,
} from '@/types/donasiBersama';

const STATUS_LABEL: Record<DonasiBersamaBatchStatus, string> = {
  draft: 'BELUM MULAI',
  active: 'BERJALAN',
  ended: 'SELESAI',
};

interface DonasiBersamaBatchRowProps {
  batch: DonasiBersamaBatch;
  amountLabel: string;
  /** Menu aksi hanya dirender untuk kreator grup. */
  canManage: boolean;
  onPress: (batch: DonasiBersamaBatch) => void;
  onPressMenu: (batch: DonasiBersamaBatch) => void;
}

export function DonasiBersamaBatchRow({
  batch,
  amountLabel,
  canManage,
  onPress,
  onPressMenu,
}: DonasiBersamaBatchRowProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.8}
      onPress={() => onPress(batch)}
      accessibilityRole="button"
      accessibilityLabel={`Batch ke-${batch.sequence}, ${batch.label}, ${batch.contributionCount} urunan, ${amountLabel}`}>
      {/* Nomor urut dari server. Nama batch bebas diubah kreator, jadi
          urutannya tidak lagi bisa dibaca dari namanya. */}
      <View style={[styles.sequence, styles[`${batch.status}Sequence`]]}>
        <Text style={[styles.sequenceText, styles[`${batch.status}Text`]]}>
          {batch.sequence}
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.label}>{batch.label}</Text>
          <View style={[styles.statusBadge, styles[`${batch.status}Badge`]]}>
            <Text style={[styles.statusText, styles[`${batch.status}Text`]]}>
              {STATUS_LABEL[batch.status]}
            </Text>
          </View>
        </View>
        <Text style={styles.meta}>
          {`${batch.contributionCount} urunan · dibuka ${formatDate(batch.createdAt)}`}
        </Text>
        <Text style={styles.amount}>{amountLabel}</Text>
      </View>
      {canManage ? (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => onPressMenu(batch)}
          accessibilityRole="button"
          accessibilityLabel={`Kelola ${batch.label}`}>
          <Icon icon={MenuDots} size={20} color={colors.neutral[600]} />
        </TouchableOpacity>
      ) : null}
      <Icon icon={AltArrowRight} size={20} color={colors.primary[600]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  sequence: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sequenceText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  draftSequence: {backgroundColor: colors.neutral[200]},
  activeSequence: {backgroundColor: colors.primary[100]},
  endedSequence: {backgroundColor: colors.secondary[100]},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
  },
  draftBadge: {backgroundColor: colors.neutral[200]},
  draftText: {color: colors.neutral[600]},
  activeBadge: {backgroundColor: colors.primary[100]},
  activeText: {color: colors.primary[700]},
  endedBadge: {backgroundColor: colors.secondary[100]},
  endedText: {color: colors.secondary[700]},
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  amount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
});
