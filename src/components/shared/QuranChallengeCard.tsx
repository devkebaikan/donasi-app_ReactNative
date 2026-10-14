import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {QuranProgressBar} from '@/components/shared/QuranProgressBar';
import {
  aurora,
  colors,
  quranCardGradient,
  spacing,
  radius,
  fontSize,
  fontWeight,
} from '@/theme';
import type {ChallengeSummary} from '@/types/quran';

const CARD_IMAGE = require('@/assets/images/mosque_solid_teal.png');

// Ilustrasi menjorok sedikit keluar kartu di kanan bawah. Jarak aman konten
// diturunkan dari ukurannya, bukan angka tebakan — supaya progress bar dan
// teks berhenti tepat sebelum gambar, berapa pun ukurannya nanti diubah.
const ILLUSTRATION_WIDTH = 110;
const ILLUSTRATION_OVERHANG = spacing.sm;
const CONTENT_RIGHT_INSET =
  ILLUSTRATION_WIDTH - ILLUSTRATION_OVERHANG - spacing.lg;

interface QuranChallengeCardProps {
  challenge: ChallengeSummary;
  width: number;
  /** Tinggi slide. Disamakan antar slide supaya paging tidak melompat. */
  height?: number;
  onPress: (challenge: ChallengeSummary) => void;
}

export function QuranChallengeCard({
  challenge,
  width,
  height,
  onPress,
}: QuranChallengeCardProps): React.JSX.Element {
  const {isJoined, joinedDayCount, lastReadSurahName, progressPercentage} =
    challenge;

  return (
    <TouchableOpacity
      style={[styles.card, {width, height}]}
      onPress={() => onPress(challenge)}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={
        isJoined
          ? `Challenge ${challenge.name}, progres ${progressPercentage} persen`
          : `Challenge ${challenge.name}, belum diikuti`
      }>
      <LinearGradient
        colors={quranCardGradient.colors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradient}
      />

      <Image source={CARD_IMAGE} style={styles.image} resizeMode="contain" />

      <View style={styles.content}>
        <Text style={styles.label}>CHALLENGE</Text>
        <Text style={styles.name} numberOfLines={1}>
          {challenge.name}
        </Text>

        {isJoined ? (
          <>
            {/* Jumlah hari jadi teks terbesar di kartu — itu angka yang
                paling sering dicari peserta challenge. */}
            <Text style={styles.dayCount}>
              {joinedDayCount != null ? `Hari ke-${joinedDayCount}` : '-'}
            </Text>

            {/* Surah terakhir di kiri, persentase di kanan — satu baris,
                lalu bar di baris tersendiri di bawahnya. */}
            <View style={styles.metaRow}>
              <Text style={styles.meta} numberOfLines={1}>
                {lastReadSurahName
                  ? `Sampai surah ${lastReadSurahName}`
                  : 'Belum ada bacaan'}
              </Text>
              <Text style={styles.percentage}>{progressPercentage}%</Text>
            </View>

            <QuranProgressBar
              percentage={progressPercentage}
              trackColor={aurora.glassOverlay}
              fillColor={colors.secondary[500]}
            />
          </>
        ) : (
          <Text style={styles.meta} numberOfLines={2}>
            Ikuti challenge ini dan mulai bacaanmu
          </Text>
        )}
      </View>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 148,
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    // Tepi putih tipis, bukan garis berwarna — kartu jadi terasa "frosted"
    // dan tidak ada satu warna pun yang mengunci gradient di satu sisi.
    borderWidth: 1,
    borderColor: aurora.glassBorder,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Ilustrasi dekoratif di kanan bawah, di belakang teks.
  image: {
    position: 'absolute',
    right: -ILLUSTRATION_OVERHANG,
    bottom: -ILLUSTRATION_OVERHANG,
    width: ILLUSTRATION_WIDTH,
    height: ILLUSTRATION_WIDTH,
    opacity: 0.2,
  },
  content: {
    // Teks dan progress bar berhenti sebelum ilustrasi, tidak menyentuhnya.
    paddingRight: CONTENT_RIGHT_INSET,
    gap: spacing.xs,
  },
  // Eyebrow: kecil, uppercase, berjarak huruf — penanda jenis kartu, bukan
  // judul. Ukurannya paling kecil supaya tidak bersaing dengan nama challenge.
  label: {
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * 1.4,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
    color: colors.primary[700],
  },
  name: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * 1.3,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  // Teks terbesar di kartu. lineHeight dirapatkan supaya angka yang besar
  // tidak menyisakan ruang kosong di atas-bawahnya.
  dayCount: {
    fontSize: fontSize['2xl'],
    lineHeight: fontSize['2xl'] * 1.15,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  meta: {
    flexShrink: 1,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.4,
    fontWeight: fontWeight.regular,
    color: colors.neutral[600],
  },
  // Sejajar dengan teks surah terakhir, ditebalkan supaya angkanya tetap
  // menonjol tanpa perlu ukuran sebesar jumlah hari.
  percentage: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * 1.3,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
});
