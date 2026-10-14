import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {DocumentText, AltArrowRight} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {formatDate} from '@/utils/formatDate';
import {colors, spacing, radius, fontSize, fontWeight, shadows} from '@/theme';
import type {OrganizationReport} from '@/types/organization';

interface LaporanCardProps {
  report: OrganizationReport;
  onPress: (report: OrganizationReport) => void;
}

export function LaporanCard({
  report,
  onPress,
}: LaporanCardProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(report)}
      accessibilityRole="button"
      accessibilityLabel={`Buka ${report.title}`}>
      <View style={styles.iconWrapper}>
        <Icon icon={DocumentText} size={24} color={colors.primary[600]} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {report.title}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.periodBadge}>
            <Text style={styles.periodBadgeText}>{report.periodLabel}</Text>
          </View>
          <Text style={styles.date}>{formatDate(report.publishedAt)}</Text>
        </View>
      </View>
      <Icon icon={AltArrowRight} size={20} color={colors.neutral[400]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
    ...shadows.sm,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[50],
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  periodBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.semantic.successLight,
  },
  periodBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.semantic.success,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
});
