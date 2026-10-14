import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {VerifiedCheck} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {TrackingMitra} from '@/types/tracking';

// "Foto mitra, label 'Mitra Salur' di bawahnya nama mitra, icon checklist
// mitra (rata kiri)" — dipakai identik oleh TrackingProgramCard (Card
// Program) & TrackingProjectSalurCard (Card Project Salur), supaya tidak
// duplikasi antar 2 kartu. Polanya sengaja disamakan dengan FundraiserCard
// (foto + label caption + nama+checklist, dibungkus box neutral[50]) —
// "informasi mitra seperti design yg ada di halaman lain" — cuma tanpa
// chevron/onPress sendiri karena bukan target tap terpisah (seluruh kartu
// pemanggil sudah 1 target tap).
interface TrackingMitraRowProps {
  mitra: TrackingMitra;
}

const MITRA_LABEL = 'Mitra Salur';

export function TrackingMitraRow({mitra}: TrackingMitraRowProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Image
        source={{uri: mitra.photoUrl}}
        style={styles.photo}
        resizeMode="cover"
        accessibilityRole="image"
        accessibilityLabel={`Logo ${mitra.name}`}
      />
      <View style={styles.info}>
        <Text style={styles.label}>{MITRA_LABEL}</Text>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {mitra.name}
          </Text>
          {mitra.isVerified ? (
            <Icon icon={VerifiedCheck} size={16} color={colors.primary[500]} />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
  },
  // Ukuran sama dengan foto mitra di FundraiserCard — komponen mitra
  // reusable lain yang sudah ada di app (label+nama+checklist).
  photo: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
  },
  info: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
});
