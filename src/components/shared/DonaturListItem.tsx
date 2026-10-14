import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Heart} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {Avatar} from '@/components/ui/Avatar';
import {formatCurrency} from '@/utils/formatCurrency';
import {formatRelativeTime} from '@/utils/formatRelativeTime';
import {colors, spacing, radius, fontSize, fontWeight, lineHeight} from '@/theme';
import type {ProgramDonatur} from '@/types/programDetail';

interface DonaturListItemProps {
  donatur: ProgramDonatur;
  onPressAamiin: (donatur: ProgramDonatur) => void;
}

export function DonaturListItem({
  donatur,
  onPressAamiin,
}: DonaturListItemProps): React.JSX.Element {
  const displayName = donatur.isAnonymous ? 'Hamba Allah' : donatur.name;
  // Anonim: foto ikut disembunyikan supaya identitas tidak bocor lewat avatar
  const photoUri = donatur.isAnonymous ? null : donatur.photoUrl ?? null;

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`${displayName}, ${formatCurrency(donatur.amount)}`}>
      <View style={styles.row}>
        <Avatar uri={photoUri} name={displayName} size={40} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.meta}>
            {formatRelativeTime(donatur.createdAt)} via{' '}
            {donatur.paymentMethodName}
          </Text>
        </View>
        <Text style={styles.amount}>{formatCurrency(donatur.amount)}</Text>
      </View>

      {donatur.prayer ? (
        <View style={styles.prayerCard}>
          <Text style={styles.prayerText}>{donatur.prayer}</Text>
          <View style={styles.prayerFooter}>
            <Text style={styles.prayerCaption}>
              Yuk Aamiin-kan doa saudara kita
            </Text>
            <TouchableOpacity
              style={styles.aamiinButton}
              onPress={() => onPressAamiin(donatur)}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              accessibilityRole="button"
              accessibilityLabel={`Aamiin-kan doa ${displayName}`}>
              <Icon icon={Heart} size={14} color={colors.secondary[500]} />
              <Text style={styles.aamiinLabel}>Aamiin</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  meta: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  amount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  prayerCard: {
    marginLeft: 40 + spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[50],
    gap: spacing.sm,
  },
  prayerText: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[700],
  },
  prayerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  prayerCaption: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  aamiinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.secondary[200],
    backgroundColor: colors.secondary[50],
  },
  aamiinLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.secondary[500],
  },
});
