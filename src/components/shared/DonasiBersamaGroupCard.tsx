import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {AltArrowRight} from '@solar-icons/react-native/Linear';
import {UsersGroupTwoRounded, CheckCircle} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {ProgramProgressBar} from '@/components/shared/ProgramProgressBar';
import {DonasiBersamaAvatarStack} from '@/components/shared/DonasiBersamaAvatarStack';
import {getDonationProgress} from '@/utils/donationProgress';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {DonasiBersamaGroup} from '@/types/donasiBersama';

interface DonasiBersamaGroupCardProps {
  group: DonasiBersamaGroup;
  onPress: (group: DonasiBersamaGroup) => void;
}

// Ritme visual kartu ini mengikuti DonationListCard (latar neutral[50], radius
// lg, padding sm, judul fontSize.sm, label fontSize.xs, tanpa shadow) supaya
// daftar grup terbaca sebagai bagian dari aplikasi yang sama — bukan kartu
// dengan bahasa visualnya sendiri.
export function DonasiBersamaGroupCard({
  group,
  onPress,
}: DonasiBersamaGroupCardProps): React.JSX.Element {
  // Dibulatkan ke bawah supaya 99,7% tidak tampil 100% sebelum target
  // benar-benar tercapai. Bar-nya sendiri sudah dibatasi 100 oleh helper.
  const progress = getDonationProgress(
    group.collectedAmount,
    group.targetAmount,
  );
  const percentage = Math.floor(progress);
  const progressText = group.progressLabel
    ? `${percentage}% (${group.progressLabel})`
    : `${percentage}%`;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => onPress(group)}
      accessibilityRole="button"
      accessibilityLabel={`${group.name}, progres ${percentage} persen, sisa ${group.daysLeft} hari`}>
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Icon
              icon={UsersGroupTwoRounded}
              size={10}
              color={colors.secondary[600]}
            />
            <Text style={styles.badgeText}>GRUP</Text>
          </View>
          {group.isMember ? (
            <View style={styles.joinedBadge}>
              <Icon icon={CheckCircle} size={10} color={colors.primary[600]} />
              <Text style={styles.joinedText}>BERGABUNG</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.daysLeft}>
          {`${Math.max(0, group.daysLeft)} Hari`}
        </Text>
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {group.name}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {group.description}
      </Text>

      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>Progres Grup</Text>
        <Text style={styles.progressValue}>{progressText}</Text>
      </View>
      <ProgramProgressBar progress={progress} />

      <View style={styles.bottomRow}>
        <DonasiBersamaAvatarStack
          members={group.memberPreviews}
          memberCount={group.memberCount}
        />
        {/* Bergabung hanya bisa dari halaman detail — tidak masuk akal
            mengajak orang gabung sebelum tahu isi grupnya. Panah ini murni
            penanda bahwa kartunya bisa dibuka. */}
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.primary[100],
  },
  joinedText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[700],
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
