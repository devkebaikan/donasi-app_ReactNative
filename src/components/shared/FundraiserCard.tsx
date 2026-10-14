import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {VerifiedCheck, AltArrowRight} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {ProgramOrganization} from '@/types/programDetail';

interface FundraiserCardProps {
  organization: ProgramOrganization;
  /** Default "Penggalang Dana" — dipakai DetailProgramScreen. DetailProjectSalurScreen pakai "Lembaga Mitra". */
  label?: string;
  onPress: () => void;
}

export function FundraiserCard({
  organization,
  label = 'Penggalang Dana',
  onPress,
}: FundraiserCardProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Lihat profil penggalang dana ${organization.name}`}>
      {organization.logoUrl ? (
        <Image
          source={{uri: organization.logoUrl}}
          style={styles.logo}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={`Logo ${organization.name}`}
        />
      ) : (
        <View style={styles.logo} />
      )}
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {organization.name}
          </Text>
          {organization.isVerified && (
            <Icon icon={VerifiedCheck} size={16} color={colors.primary[500]} />
          )}
        </View>
      </View>
      <Icon icon={AltArrowRight} size={20} color={colors.neutral[400]} />
    </TouchableOpacity>
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
  logo: {
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
