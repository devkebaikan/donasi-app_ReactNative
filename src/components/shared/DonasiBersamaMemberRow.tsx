import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Star, Cup} from '@solar-icons/react-native/Bold';
import {AltArrowRight} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {Avatar} from '@/components/ui/Avatar';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {DonasiBersamaMember} from '@/types/donasiBersama';

interface DonasiBersamaMemberRowProps {
  member: DonasiBersamaMember;
  onPress: (member: DonasiBersamaMember) => void;
}

export function DonasiBersamaMemberRow({
  member,
  onPress,
}: DonasiBersamaMemberRowProps): React.JSX.Element {
  // Kreator dan badge tidak pernah tampil bersamaan — dua penanda di satu
  // baris membuat nama terdorong keluar di layar sempit.
  const showBadge = !member.isCreator && member.badgeLabel !== null;

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.8}
      onPress={() => onPress(member)}
      accessibilityRole="button"
      accessibilityLabel={
        showBadge
          ? `${member.name}, ${member.roleLabel}, ${member.badgeLabel}`
          : `${member.name}, ${member.roleLabel}`
      }>
      <Avatar uri={member.avatarUrl} name={member.name} size={48} />

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {member.name}
        </Text>
        <Text style={styles.role} numberOfLines={1}>
          {member.roleLabel}
        </Text>
      </View>

      {member.isCreator ? (
        <View style={styles.starWrapper}>
          <Icon icon={Star} size={16} color={colors.secondary[600]} />
        </View>
      ) : showBadge ? (
        <View style={styles.badge}>
          <Icon icon={Cup} size={12} color={colors.secondary[600]} />
          <Text style={styles.badgeText} numberOfLines={2}>
            {member.badgeLabel}
          </Text>
        </View>
      ) : null}

      <Icon icon={AltArrowRight} size={20} color={colors.primary[600]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  role: {
    fontSize: fontSize.xs,
    color: colors.primary[600],
  },
  starWrapper: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.secondary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    // Dibatasi supaya badge panjang tidak mendorong nama keluar layar.
    maxWidth: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.secondary[200],
    backgroundColor: colors.secondary[50],
  },
  badgeText: {
    flexShrink: 1,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.secondary[600],
  },
});
