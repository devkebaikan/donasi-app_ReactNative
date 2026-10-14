import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {Copy} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {showToast} from '@/utils/toast';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

interface CopyableFieldProps {
  label: string;
  value: string;
  displayValue?: React.ReactNode;
}

export function CopyableField({
  label,
  value,
  displayValue,
}: CopyableFieldProps): React.JSX.Element {
  function handleCopy(): void {
    Clipboard.setString(value);
    showToast('Tersalin');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Text style={styles.value} numberOfLines={1}>
          {displayValue ?? value}
        </Text>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopy}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          accessibilityRole="button"
          accessibilityLabel={`Salin ${label}`}>
          <Icon icon={Copy} size={14} color={colors.primary[500]} />
          <Text style={styles.copyText}>Salin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  value: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 32,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  copyText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[500],
  },
});
