import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {TuningSquare, CalendarMark} from '@solar-icons/react-native/Linear';
import {Moon} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {TantanganDayStatus} from '@/types/tantangan';

interface TantanganDayStatusChipsProps {
  status: TantanganDayStatus;
  /** Dikunci saat jurnal dibuka pada tanggal selain hari ini. */
  isLocked?: boolean;
  onChange: (next: {isFasting: boolean; isExcused: boolean}) => void;
}

// Dua chip MANDIRI — keduanya bisa menyala bersamaan, jadi ini bukan pemilih
// satu-dari-dua dan tidak memakai bentuk segmented.
export function TantanganDayStatusChips({
  status,
  isLocked = false,
  onChange,
}: TantanganDayStatusChipsProps): React.JSX.Element {
  function toggleFasting(): void {
    onChange({isFasting: !status.isFasting, isExcused: status.isExcused});
  }

  function toggleExcused(): void {
    onChange({isFasting: status.isFasting, isExcused: !status.isExcused});
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Icon icon={TuningSquare} size={18} color={colors.neutral[600]} />
        <Text style={styles.label}>Status Khusus Hari Ini</Text>
      </View>

      <View style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, status.isFasting && styles.chipActive]}
          disabled={isLocked}
          onPress={toggleFasting}
          accessibilityRole="switch"
          accessibilityState={{checked: status.isFasting, disabled: isLocked}}
          accessibilityLabel="Sedang Puasa">
          <Icon
            icon={Moon}
            size={16}
            color={status.isFasting ? colors.neutral[0] : colors.neutral[600]}
          />
          <Text
            style={[styles.chipLabel, status.isFasting && styles.chipLabelActive]}>
            Sedang Puasa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, status.isExcused && styles.chipActive]}
          disabled={isLocked}
          onPress={toggleExcused}
          accessibilityRole="switch"
          accessibilityState={{checked: status.isExcused, disabled: isLocked}}
          accessibilityLabel="Sedang Berhalangan">
          <Icon
            icon={CalendarMark}
            size={16}
            color={status.isExcused ? colors.neutral[0] : colors.neutral[600]}
          />
          <Text
            style={[styles.chipLabel, status.isExcused && styles.chipLabelActive]}>
            Sedang Berhalangan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Keterangan hanya muncul untuk chip yang PUNYA efek. "Sedang Puasa"
          sengaja tidak diberi keterangan apa pun — di fase ini ia penanda,
          bukan pengatur, dan menjanjikan efek yang tidak ada lebih buruk
          daripada diam. */}
      {status.isExcused ? (
        <Text style={styles.hint}>Runtunmu tidak akan terputus hari ini</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
  },
  chipActive: {
    backgroundColor: colors.primary[600],
  },
  chipLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  chipLabelActive: {
    color: colors.neutral[0],
    fontWeight: fontWeight.semiBold,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.primary[600],
  },
});
