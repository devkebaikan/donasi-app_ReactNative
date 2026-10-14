import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { VerifiedCheck } from '@solar-icons/react-native/Linear';
import { Icon } from '@/components/ui/Icon';
import { colors, spacing, radius, fontSize, fontWeight } from '@/theme';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  getDonationProgress,
  formatDaysLeftLabel,
} from '@/utils/donationProgress';
import { RecommendedBadge } from '@/components/shared/RecommendedBadge';
import type { Program } from '@/types/program';

interface ProgramCardProps {
  program: Program;
  onPress: (program: Program) => void;
}

const THUMBNAIL_WIDTH = 160;
const DEFAULT_ASPECT_RATIO = 1080 / 1920; // 16:9

export function ProgramCard({
  program,
  onPress,
}: ProgramCardProps): React.JSX.Element {
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

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(program)}
      accessibilityRole="button"
      accessibilityLabel={program.title}>
      <View>
        <Image
          source={{ uri: program.image }}
          style={[styles.thumbnail, { height: imageHeight }]}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={program.title}
        />
        {program.isRecommended && <RecommendedBadge />}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {program.title}
        </Text>
        <View style={styles.organizationRow}>
          <Text style={styles.organization} numberOfLines={1}>
            {program.mitra.name}
          </Text>
          <Icon icon={VerifiedCheck} size={16} color={colors.primary[500]} />
        </View>
        <ProgressBar progress={progress} />
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.collectedLabel}>Terkumpul</Text>
            <Text style={styles.collectedAmount}>
              {formatCurrency(collectedAmount)}
            </Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.collectedLabel}>Sisa hari</Text>
            <Text style={styles.daysLeft}>
              {formatDaysLeftLabel(program.remaining_days)}
            </Text>
          </View>
        </View>
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
  },
  thumbnail: {
    width: THUMBNAIL_WIDTH,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  organizationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.xs
  },
  organization: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  collectedLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  collectedAmount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
  daysLeft: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
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
  footerRight: {
    alignItems: 'flex-end',
  }
});
