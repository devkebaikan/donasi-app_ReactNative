import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {ClockCircle, AltArrowRight} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight, lineHeight, glass} from '@/theme';

interface MyDonationsHeroBannerProps {
  onPressDonateAgain: () => void;
}

export function MyDonationsHeroBanner({
  onPressDonateAgain,
}: MyDonationsHeroBannerProps): React.JSX.Element {
  return (
    <View style={styles.wrapper}>
      <View style={styles.heroContent}>
        <View style={styles.eyebrowBadge}>
          <Icon icon={ClockCircle} size={14} color={colors.primary[600]} />
          <Text style={styles.eyebrowText}>Donasi Saya</Text>
        </View>

        <Text style={styles.heroTitle}>Jejak Kebaikanmu</Text>
        <Text style={styles.heroTitleAccent}>Tercatat dengan Indah</Text>
        <Text style={styles.heroSubtitle}>
          Setiap donasi yang kamu berikan adalah catatan pahala yang tak
          terhapuskan
        </Text>

        <TouchableOpacity
          style={styles.donateAgainButton}
          onPress={onPressDonateAgain}
          accessibilityRole="button"
          accessibilityLabel="Donasi Lagi">
          <Text style={styles.donateAgainText}>Donasi Lagi</Text>
          <Icon icon={AltArrowRight} size={16} color={colors.neutral[0]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  heroContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  eyebrowBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: glass.tint,
    borderWidth: 1,
    borderColor: glass.border,
  },
  eyebrowText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    lineHeight: fontSize['2xl'] * lineHeight.tight,
  },
  heroTitleAccent: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
    lineHeight: fontSize['2xl'] * lineHeight.tight,
    marginTop: -spacing.sm,
  },
  heroSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[600],
  },
  donateAgainButton: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.secondary[500],
    marginTop: spacing.xs,
  },
  donateAgainText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[0],
  },
});
