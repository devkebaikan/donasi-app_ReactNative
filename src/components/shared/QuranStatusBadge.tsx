import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {ScheduleStatus} from '@/types/quran';

interface StatusConfig {
  label: string;
  background: string;
  text: string;
}

const STATUS_CONFIG: Record<ScheduleStatus, StatusConfig> = {
  DIJADWALKAN: {
    label: 'Dijadwalkan',
    background: colors.neutral[200],
    text: colors.neutral[700],
  },
  BERJALAN: {
    label: 'Sedang Berjalan',
    background: colors.semantic.infoLight,
    text: colors.semantic.info,
  },
  SELESAI: {
    label: 'Selesai',
    background: colors.semantic.successLight,
    text: colors.semantic.success,
  },
  TERLAMBAT: {
    label: 'Terlambat',
    background: colors.semantic.warningLight,
    text: colors.semantic.warning,
  },
};

interface QuranStatusBadgeProps {
  status: ScheduleStatus;
}

export function QuranStatusBadge({
  status,
}: QuranStatusBadgeProps): React.JSX.Element {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, {backgroundColor: config.background}]}>
      <Text style={[styles.label, {color: config.text}]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
  },
});
