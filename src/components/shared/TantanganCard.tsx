import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {AltArrowRight} from '@solar-icons/react-native/Linear';
import {
  UsersGroupTwoRounded,
  UserRounded,
} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {ProgramProgressBar} from '@/components/shared/ProgramProgressBar';
import {DonasiBersamaAvatarStack} from '@/components/shared/DonasiBersamaAvatarStack';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {Tantangan} from '@/types/tantangan';

interface TantanganCardProps {
  challenge: Tantangan;
  onPress: (challenge: Tantangan) => void;
}

// Ritme visual kartu ini mengikuti DonasiBersamaGroupCard (latar neutral[50],
// radius lg, tanpa shadow) supaya daftar tantangan terbaca sebagai bagian dari
// aplikasi yang sama — bukan kartu dengan bahasa visualnya sendiri.
export function TantanganCard({
  challenge,
  onPress,
}: TantanganCardProps): React.JSX.Element {
  const isGroup = challenge.mode === 'group';
  const isEnded = challenge.status === 'ended';
  // Dibulatkan ke bawah supaya 99,7% tidak tampil 100% sebelum target
  // benar-benar tercapai. Persentasenya sendiri dihitung server.
  const percentage = Math.floor(Math.min(100, challenge.progressPercentage));
  const progressText = challenge.progressLabel
    ? `${percentage}% (${challenge.progressLabel})`
    : `${percentage}%`;
  const daysLeftText = isEnded
    ? 'Sudah berakhir'
    : `${Math.max(0, challenge.daysLeft)} hari lagi`;
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => onPress(challenge)}
      accessibilityRole="button"
      accessibilityLabel={`${challenge.name}, ${
        isGroup ? 'berjamaah' : 'personal'
      }, progres ${percentage} persen, ${daysLeftText}${
        challenge.isJoined ? ', sudah diikuti' : ''
      }`}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Icon
            icon={isGroup ? UsersGroupTwoRounded : UserRounded}
            size={10}
            color={colors.secondary[600]}
          />
          <Text style={styles.badgeText}>
            {isGroup ? 'BERJAMAAH' : 'PERSONAL'}
          </Text>
        </View>
        <Text style={styles.daysLeft}>{daysLeftText}</Text>
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {challenge.name}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {challenge.description}
      </Text>

      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>
          {isGroup ? 'Progres Grup' : 'Progres Saya'}
        </Text>
        <Text style={styles.progressValue}>{progressText}</Text>
      </View>
      <ProgramProgressBar progress={percentage} />

      <View style={styles.bottomRow}>
        {/* Tantangan personal tidak punya peserta lain — tumpukan avatar
            kosong hanya menyisakan ruang yang membingungkan. */}
        {isGroup ? (
          <DonasiBersamaAvatarStack
            members={challenge.participantPreviews}
            memberCount={challenge.participantCount}
          />
        ) : (
          <View />
        )}
        {/* Ikut tantangan hanya bisa dari halaman detail — tidak masuk akal
            mengajak orang bergabung sebelum tahu isinya. Panah ini murni
            penanda bahwa kartunya bisa dibuka, dan bentuknya sama di semua
            state termasuk tantangan yang sudah berakhir. Pola yang sama
            dipakai DonasiBersamaGroupCard. */}
        <Icon icon={AltArrowRight} size={20} color={colors.primary[600]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.secondary[100],
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.secondary[600],
  },
  daysLeft: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  description: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  progressLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  progressValue: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
});
