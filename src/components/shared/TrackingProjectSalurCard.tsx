import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {MapPoint, UsersGroupRounded} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {TrackingMitraRow} from '@/components/shared/TrackingMitraRow';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {TrackingProjectSalur} from '@/types/tracking';

// Card Project Salur — tampil begitu status salur sudah 'persiapan' ke atas
// (project salur sudah dialokasikan), gantikan Card Program.
interface TrackingProjectSalurCardProps {
  projectSalur: TrackingProjectSalur;
  onPress: () => void;
}

export function TrackingProjectSalurCard({
  projectSalur,
  onPress,
}: TrackingProjectSalurCardProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${projectSalur.title}, lihat detail project salur`}>
      <Text style={styles.title}>{projectSalur.title}</Text>

      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <View style={styles.gridLabelRow}>
            <Icon icon={MapPoint} size={14} color={colors.neutral[500]} />
            <Text style={styles.gridLabel}>LOKASI</Text>
          </View>
          <Text style={styles.gridValue}>{projectSalur.location}</Text>
        </View>
        <View style={styles.gridItem}>
          <View style={styles.gridLabelRow}>
            <Icon icon={UsersGroupRounded} size={14} color={colors.neutral[500]} />
            <Text style={styles.gridLabel}>TARGET</Text>
          </View>
          <Text style={styles.gridValue}>
            {projectSalur.beneficiaryCount} penerima manfaat
          </Text>
        </View>
      </View>

      <TrackingMitraRow mitra={projectSalur.mitra} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[0],
    // Warna & ketebalan border disamakan dengan item "Project Salur
    // Terdekat" di DetailProgramScreen (ProjectSalurTerdekatSection) —
    // referensi resmi untuk border kartu di app ini.
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.neutral[200],
    gap: spacing.md,
  },
  // Judul konsisten dengan skala judul kartu lain di app (bukan
  // fontSize.lg/bold seperti draft sebelumnya) — lihat TrackingProgramCard.
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  // Padding gridItem disamakan dengan kartu big-number sejenis
  // (ProjectSalurAmountCards pakai spacing.md) — sebelumnya spacing.sm
  // terasa terlalu dempet.
  gridItem: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[50],
    gap: spacing.xs,
  },
  gridLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  gridLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
    letterSpacing: 0.5,
  },
  gridValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
});
