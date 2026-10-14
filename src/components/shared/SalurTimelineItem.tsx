import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {HtmlContent} from '@/components/shared/HtmlContent';
import {formatDate} from '@/utils/formatDate';
import {
  PROJECT_SALUR_STATUS_LABEL as STATUS_LABEL,
  PROJECT_SALUR_STATUS_COLOR as STATUS_COLOR,
} from '@/utils/projectSalurStatus';
import {colors, spacing, radius, fontSize, fontWeight, shadows} from '@/theme';
import type {ReportSalur} from '@/types/programDetail';

interface SalurTimelineItemProps {
  item: ReportSalur;
  isLast?: boolean;
  /**
   * Link "Lihat Detail Project Salur" — cuma diisi oleh caller yang
   * merender `ProjectSalur` (tab "Project Salur" & AllProjectSalurScreen).
   * Dibiarkan undefined di tab "Report Salur" supaya link tidak tampil di
   * sana — ReportSalur tidak punya halaman detailnya sendiri.
   */
  onPressDetail?: (id: string) => void;
}

export function SalurTimelineItem({
  item,
  isLast = false,
  onPressDetail,
}: SalurTimelineItemProps): React.JSX.Element {
  const statusColor = STATUS_COLOR[item.status];

  return (
    <View style={styles.container}>
      <View style={styles.timelineColumn}>
        <Image
          source={{uri: item.mitra.photoUrl}}
          style={styles.mitraPhoto}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={`Logo ${item.mitra.name}`}
        />
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.mitraInfo}>
            <Text style={styles.mitraName} numberOfLines={1}>
              {item.mitra.name}
            </Text>
            <Text style={styles.date}>{formatDate(item.distributedAt)}</Text>
          </View>
          <View style={[styles.badge, {backgroundColor: statusColor.bg}]}>
            <Text style={[styles.badgeText, {color: statusColor.text}]}>
              {STATUS_LABEL[item.status]}
            </Text>
          </View>
        </View>

        <Image
          source={{uri: item.photoUrl}}
          style={styles.itemPhoto}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={`Foto penyaluran ${item.title}`}
        />

        <Text style={styles.title}>{item.title}</Text>

        {item.descriptionHtml ? (
          <HtmlContent html={item.descriptionHtml} />
        ) : null}

        {onPressDetail ? (
          <TouchableOpacity
            onPress={() => onPressDetail(item.id)}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            accessibilityRole="link"
            accessibilityLabel={`Lihat detail project salur ${item.title}`}>
            <Text style={styles.detailLink}>Lihat Detail Project Salur</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineColumn: {
    alignItems: 'center',
  },
  mitraPhoto: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.neutral[300],
  },
  timelineLine: {
    flex: 1,
    width: 1,
    marginTop: spacing.xs,
    backgroundColor: colors.neutral[200],
  },
  content: {
    flex: 1,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  mitraInfo: {
    flex: 1,
    gap: 2,
  },
  mitraName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  itemPhoto: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  detailLink: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
});
