import React from 'react';
import {View, Text, TouchableOpacity, Linking, StyleSheet} from 'react-native';
import {MapPoint, Phone, VerifiedCheck} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {Avatar} from '@/components/ui/Avatar';
import {formatDate} from '@/utils/formatDate';
import {showToast} from '@/utils/toast';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {OrganizationProfile} from '@/types/organization';

interface LembagaHeaderProps {
  organization: OrganizationProfile;
}

function formatStatCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}JT`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return value.toLocaleString('id-ID');
}

export function LembagaHeader({
  organization,
}: LembagaHeaderProps): React.JSX.Element {
  async function handleCallPhone(): Promise<void> {
    const dialNumber = organization.phone.replace(/[^\d+]/g, '');
    try {
      await Linking.openURL(`tel:${dialNumber}`);
    } catch {
      showToast('Tidak dapat membuka aplikasi telepon.');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileRow}>
        <View style={styles.avatarBorder}>
          <Avatar uri={organization.logoUrl || null} name={organization.name} size={64} />
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={2}>
              {organization.name}
            </Text>
            {organization.isVerified && (
              <Icon icon={VerifiedCheck} size={16} color={colors.primary[500]} />
            )}
          </View>
          <Text style={styles.joinedAt}>
            Bergabung sejak {formatDate(organization.joinedAt)}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow} accessibilityRole="text">
          <View style={styles.iconWrapper}>
            <Icon icon={MapPoint} size={20} color={colors.primary[600]} />
          </View>
          <Text style={styles.infoText} numberOfLines={2}>
            {organization.location}
          </Text>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.infoRow}
          onPress={handleCallPhone}
          accessibilityRole="button"
          accessibilityLabel={`Telepon ${organization.name} di ${organization.phone}`}>
          <View style={styles.iconWrapper}>
            <Icon icon={Phone} size={20} color={colors.primary[600]} />
          </View>
          <Text style={[styles.infoText, styles.phoneText]}>
            {organization.phone}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatStatCount(organization.stats.programs)}
            </Text>
            <Text style={styles.statLabel}>Program</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatStatCount(organization.stats.donatur)}
            </Text>
            <Text style={styles.statLabel}>Donatur</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarBorder: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    flexShrink: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  joinedAt: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  infoCard: {
    paddingVertical: spacing.sm,
    gap: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[100],
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  phoneText: {
    color: colors.primary[600],
    fontWeight: fontWeight.semiBold,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral[200],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    height: '100%',
    backgroundColor: colors.neutral[200],
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
});
