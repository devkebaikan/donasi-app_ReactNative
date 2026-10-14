import React from 'react';
import {View, Text, Image, ScrollView, StyleSheet} from 'react-native';
import {formatRelativeDate} from '@/utils/formatDate';
import {
  PROJECT_SALUR_STATUS_LABEL as STATUS_LABEL,
  PROJECT_SALUR_STATUS_COLOR as STATUS_COLOR,
} from '@/utils/projectSalurStatus';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {TrackingReportCard} from '@/types/tracking';

// Carousel Card Report Salur — horizontal list, hanya tampil saat status
// salur 'proses'/'selesai'.
interface TrackingReportCarouselProps {
  reports: TrackingReportCard[];
}

export function TrackingReportCarousel({
  reports,
}: TrackingReportCarouselProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Report Salur</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}>
        {reports.map(report => {
          const statusColor = STATUS_COLOR[report.status];
          return (
            <View key={report.id} style={styles.card}>
              <Image
                source={{uri: report.photoUrl}}
                style={styles.photo}
                resizeMode="cover"
                accessibilityRole="image"
                accessibilityLabel={`Foto report salur ${report.title}`}
              />
              <View style={[styles.badge, {backgroundColor: statusColor.bg}]}>
                <Text style={[styles.badgeText, {color: statusColor.text}]}>
                  {STATUS_LABEL[report.status]}
                </Text>
              </View>
              <Text style={styles.title} numberOfLines={2}>
                {report.title}
              </Text>
              <Text style={styles.time}>{formatRelativeDate(report.distributedAt)}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = 200;

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  heading: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  listContent: {
    gap: spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
    // Warna & ketebalan border disamakan dengan item "Project Salur
    // Terdekat" di DetailProgramScreen (ProjectSalurTerdekatSection).
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.neutral[200],
    padding: spacing.sm,
    // Gap antar elemen (foto/badge/judul/waktu) dinaikkan dari spacing.xs
    // supaya tidak terlalu dempet, tapi tetap sepadan (bukan spacing.md yang
    // bikin kartu sekecil ini kelihatan longgar).
    gap: spacing.sm,
  },
  photo: {
    width: '100%',
    height: 110,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[200],
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
});
