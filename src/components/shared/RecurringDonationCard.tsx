import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {ClockCircle, AltArrowRight} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {formatCurrency} from '@/utils/formatCurrency';
import {formatRecurringSchedule} from '@/utils/formatDate';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {RecurringDonation} from '@/types/recurringDonation';

// Foto program selalu landscape 16:9 di semua kartu program — lihat
// DonationHistoryItem/DonationListCard. Sebelumnya thumbnail di sini persegi
// sehingga foto yang sama tampil terpotong berbeda dari daftar donasi.
const THUMBNAIL_WIDTH = 100;
const THUMBNAIL_HEIGHT = (THUMBNAIL_WIDTH * 9) / 16;

const STATUS_LABEL: Record<RecurringDonation['status'], string> = {
  AKTIF: 'AKTIF',
  JEDA: 'JEDA',
};

const STATUS_COLOR: Record<RecurringDonation['status'], {bg: string; text: string}> = {
  AKTIF: {bg: colors.semantic.successLight, text: colors.semantic.success},
  JEDA: {bg: colors.neutral[100], text: colors.neutral[500]},
};

interface RecurringDonationCardProps {
  donation: RecurringDonation;
  onPress: () => void;
}

// Kartu ini SENGAJA cuma punya satu aksi. Sebelumnya ada icon ubah dan hapus
// di sudut kanan bawah; keduanya pindah ke menu di header
// DetailDonasiRutinScreen. Aksi merusak tidak boleh menempel pada baris yang
// bergerak saat digulir — lihat docs/08-features/donasi-rutin/README.md.
//
// Bentuknya mengikuti ritme kartu daftar lain di app ini: latar neutral[50] di
// atas halaman putih, thumbnail landscape di kiri, isi rapat di kanan, dan panah
// penanda "bisa dibuka" di ujung kanan — sama seperti DonasiBersamaGroupCard.
// Tidak ada tombol maupun teks "Detail": badan kartunya sendiri sudah bisa
// ditekan, jadi keduanya cuma menggandakan aksi yang sama sambil menggemukkan
// kartu.
export function RecurringDonationCard({
  donation,
  onPress,
}: RecurringDonationCardProps): React.JSX.Element {
  const statusColor = STATUS_COLOR[donation.status];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${donation.programTitle}, status ${STATUS_LABEL[donation.status]}, ${formatRecurringSchedule(donation)}, nominal ${formatCurrency(donation.amount)}`}>
      <Image source={{uri: donation.programImageUrl}} style={styles.thumbnail} />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {donation.programTitle}
          </Text>
          <View style={[styles.badge, {backgroundColor: statusColor.bg}]}>
            <Text style={[styles.badgeText, {color: statusColor.text}]}>
              {STATUS_LABEL[donation.status]}
            </Text>
          </View>
        </View>

        <View style={styles.scheduleRow}>
          <Icon icon={ClockCircle} size={14} color={colors.neutral[500]} />
          <Text style={styles.scheduleText} numberOfLines={1}>
            {formatRecurringSchedule(donation)}
          </Text>
        </View>

        <Text style={styles.amount}>{formatCurrency(donation.amount)}</Text>
      </View>

      <View style={styles.chevron}>
        <Icon icon={AltArrowRight} size={20} color={colors.primary[600]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  thumbnail: {
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[200],
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  scheduleText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  amount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  chevron: {
    justifyContent: 'center',
  },
});
