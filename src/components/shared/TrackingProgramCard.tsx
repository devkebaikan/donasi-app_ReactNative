import React from 'react';
import {Text, Image, TouchableOpacity, View, StyleSheet} from 'react-native';
import {TrackingMitraRow} from '@/components/shared/TrackingMitraRow';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {TrackingProgram} from '@/types/tracking';

// Card Program — tampil di semua status pembayaran, dan saat status salur
// masih 'menunggu' (project salur belum dialokasikan). Foto full-bleed
// (nempel ke tepi kartu, tanpa padding) — pola yang sama dengan kartu
// program lain di app (ProgramCard/DonationListCard varian grid), bukan
// foto yang dikasih padding seperti draft sebelumnya.
interface TrackingProgramCardProps {
  program: TrackingProgram;
  onPress: () => void;
}

export function TrackingProgramCard({
  program,
  onPress,
}: TrackingProgramCardProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${program.title}, lihat detail program`}>
      <Image
        source={{uri: program.imageUrl}}
        style={styles.photo}
        resizeMode="cover"
        accessibilityRole="image"
        accessibilityLabel={program.title}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {program.title}
        </Text>
        <TrackingMitraRow mitra={program.mitra} />
      </View>
    </TouchableOpacity>
  );
}

const PHOTO_HEIGHT = 140;

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[0],
    // Warna & ketebalan border disamakan dengan item "Project Salur
    // Terdekat" di DetailProgramScreen (ProjectSalurTerdekatSection) —
    // referensi resmi untuk border kartu di app ini.
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.neutral[200],
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: PHOTO_HEIGHT,
    backgroundColor: colors.neutral[200],
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  // Judul sengaja tidak sebesar versi sebelumnya (dulu fontSize.lg/bold) —
  // konsisten dengan skala judul kartu lain di app (ProgramCard,
  // DonationListCard, DonationHistoryItem semuanya fontSize.sm/semiBold).
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
});
