import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Avatar} from '@/components/ui/Avatar';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {DonasiBersamaMemberPreview} from '@/types/donasiBersama';

const AVATAR_SIZE = 24;
const OVERLAP = -8;
const MAX_VISIBLE = 3;

interface DonasiBersamaAvatarStackProps {
  members: DonasiBersamaMemberPreview[];
  memberCount: number;
}

// Tumpukan foto anggota + pil "+n" di kartu grup. Seluruh tumpukan
// accessible={false}: jumlah anggota sudah masuk ke accessibilityLabel kartu,
// jadi screen reader tidak perlu membacakan tiap foto satu per satu.
export function DonasiBersamaAvatarStack({
  members,
  memberCount,
}: DonasiBersamaAvatarStackProps): React.JSX.Element {
  const visible = members.slice(0, MAX_VISIBLE);
  const remaining = memberCount - visible.length;

  return (
    <View style={styles.container} accessible={false} importantForAccessibility="no-hide-descendants">
      {visible.map((member, index) => (
        <View
          key={member.id}
          style={[styles.avatarWrapper, index > 0 && styles.avatarOverlap]}>
          <Avatar uri={member.avatarUrl} name={member.name} size={AVATAR_SIZE} />
        </View>
      ))}
      {remaining > 0 ? (
        <View
          style={[
            styles.avatarWrapper,
            styles.remainingPill,
            visible.length > 0 && styles.avatarOverlap,
          ]}>
          <Text style={styles.remainingText}>{`+${remaining}`}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.neutral[0],
  },
  avatarOverlap: {
    marginLeft: OVERLAP,
  },
  remainingPill: {
    height: AVATAR_SIZE,
    minWidth: AVATAR_SIZE,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[200],
  },
  remainingText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[600],
  },
});
