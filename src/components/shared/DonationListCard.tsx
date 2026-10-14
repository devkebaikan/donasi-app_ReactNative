import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { VerifiedCheck } from '@solar-icons/react-native/Linear';
import { Icon } from '@/components/ui/Icon';
import { RecommendedBadge } from '@/components/shared/RecommendedBadge';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  getDonationProgress,
  formatDaysLeftValue,
} from '@/utils/donationProgress';
import { colors, spacing, radius, fontSize, fontWeight, lineHeight } from '@/theme';
import type { Program } from '@/types/program';
import type { ViewMode } from '@/types/donationFilter';

interface DonationListCardProps {
  program: Program;
  variant: ViewMode;
  onPress: (program: Program) => void;
}

const THUMBNAIL_WIDTH = 160;
const DEFAULT_ASPECT_RATIO = 1080 / 1920; // 16:9
const TITLE_LINE_HEIGHT = fontSize.sm * lineHeight.normal;

export function DonationListCard({
  program,
  variant,
  onPress,
}: DonationListCardProps): React.JSX.Element {
  const [imageHeight, setImageHeight] = useState<number>(THUMBNAIL_WIDTH * DEFAULT_ASPECT_RATIO);

  const collectedAmount = Number(program.nominal_achieved) || 0;
  const progress = getDonationProgress(
    collectedAmount,
    program.nominal_target,
  );

  useEffect(() => {
    Image.getSize(
      program.image,
      (width, height) => {
        const aspectRatio = height / width;
        setImageHeight(THUMBNAIL_WIDTH * aspectRatio);
      },
      () => {
        setImageHeight(THUMBNAIL_WIDTH * DEFAULT_ASPECT_RATIO);
      },
    );
  }, [program.image]);

  if (variant === 'grid') {
    return (
      <TouchableOpacity
        testID={`donation-card-${program.id}`}
        style={styles.gridCard}
        onPress={() => onPress(program)}
        accessibilityRole="button"
        accessibilityLabel={program.title}>
        <View>
          <Image
            source={{ uri: program.image }}
            style={styles.gridThumbnail}
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel={program.title}
          />
          {program.isRecommended && <RecommendedBadge />}
        </View>
        <View style={styles.gridContent}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {program.title}
          </Text>

          <View style={styles.organizationRow}>
            <Text style={styles.organization} numberOfLines={1}>
              {program.mitra.name}
            </Text>

            <Icon icon={VerifiedCheck} size={13} color={colors.primary[500]} />
          </View>

          <ProgressBar progress={progress} />
          <Footer collectedAmount={collectedAmount} remainingDays={program.remaining_days} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      testID={`donation-card-${program.id}`}
      style={styles.listCard}
      onPress={() => onPress(program)}
      accessibilityRole="button"
      accessibilityLabel={program.title}>
      <View>
        <Image
          source={{ uri: program.image }}
          style={[styles.listThumbnail, { height: imageHeight }]}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={program.title}
        />
        {program.isRecommended && <RecommendedBadge />}
      </View>

      <View style={styles.listContent}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {program.title}
        </Text>

        <View style={styles.organizationRow}>
          <Text style={styles.organization} numberOfLines={1}>
            {program.mitra.name}
          </Text>
          <Icon icon={VerifiedCheck} size={13} color={colors.primary[500]} />
        </View>

        {/* <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText} numberOfLines={1}>
            {program.category.name}
          </Text>
        </View> */}

        <ProgressBar progress={progress} />
        <Footer collectedAmount={collectedAmount} remainingDays={program.remaining_days} />
      </View>
    </TouchableOpacity>
  );
}

function ProgressBar({ progress }: { progress: number }): React.JSX.Element {
  return (
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: `${progress}%` }]} />
    </View>
  );
}

function Footer({ collectedAmount, remainingDays }: { collectedAmount: number; remainingDays: number | null }): React.JSX.Element {
  return (
    <View style={styles.footer}>
      <View>
        <Text style={styles.footerLabel}>Terkumpul</Text>
        <Text style={styles.footerValue} numberOfLines={1}>
          {formatCurrency(collectedAmount)}
        </Text>
      </View>
      <View style={styles.footerRight}>
        <Text style={styles.footerLabel}>Sisa Hari</Text>
        <Text style={styles.footerValue}>
          {formatDaysLeftValue(remainingDays)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listCard: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
    padding: spacing.sm,
    gap: spacing.md,
  },
  listThumbnail: {
    width: THUMBNAIL_WIDTH,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[200],
  },
  listContent: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  gridCard: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
    overflow: 'hidden',
    gap: spacing.sm,
  },
  gridThumbnail: {
    width: '100%',
    // Landscape 16:9 — sama dengan varian list dan kartu program lainnya.
    aspectRatio: 16 / 9,
    backgroundColor: colors.neutral[200],
  },
  gridContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  // Judul selalu memakan ruang 2 baris — judul pendek pun tetap menyisakan
  // baris kedua supaya bar progres & footer semua kartu sejajar, dan judul
  // panjang dipotong "..." di ujung baris kedua.
  title: {
    fontSize: fontSize.sm,
    lineHeight: TITLE_LINE_HEIGHT,
    minHeight: TITLE_LINE_HEIGHT * 2,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  organizationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.xs,
  },
  organization: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  categoryBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.semantic.warningLight,
  },
  categoryBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.semantic.warning,
  },
  progressBar: {
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FD6542',
    borderRadius: radius.full,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  footerValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
});
