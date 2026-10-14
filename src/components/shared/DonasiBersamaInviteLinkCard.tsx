import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {Copy} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {showToast} from '@/utils/toast';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

interface DonasiBersamaInviteLinkCardProps {
  inviteUrl: string | null;
}

export function DonasiBersamaInviteLinkCard({
  inviteUrl,
}: DonasiBersamaInviteLinkCardProps): React.JSX.Element {
  function handleCopy(): void {
    if (!inviteUrl) {
      return;
    }
    Clipboard.setString(inviteUrl);
    showToast('Tautan undangan disalin');
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>TAUTAN UNDANGAN UNIK</Text>
      <View style={styles.row}>
        {/* Seluruh field bisa ditekan, bukan cuma ikonnya — target sentuh
            lebih besar untuk aksi yang sama. */}
        <TouchableOpacity
          style={styles.field}
          onPress={handleCopy}
          disabled={!inviteUrl}
          accessibilityRole="button"
          accessibilityLabel="Salin tautan undangan">
          {inviteUrl ? (
            <Text style={styles.link} numberOfLines={1} ellipsizeMode="middle">
              {inviteUrl}
            </Text>
          ) : (
            <View style={styles.skeletonLine} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopy}
          disabled={!inviteUrl}
          accessibilityRole="button"
          accessibilityLabel="Salin tautan undangan">
          <Icon icon={Copy} size={20} color={colors.primary[600]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
    backgroundColor: colors.neutral[0],
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[500],
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  field: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
  },
  link: {
    fontSize: fontSize.sm,
    color: colors.neutral[700],
  },
  skeletonLine: {
    height: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[200],
  },
  copyButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
  },
});
