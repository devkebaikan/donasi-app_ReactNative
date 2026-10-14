import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {ArrowLeft, Share} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, fontSize, fontWeight} from '@/theme';

interface DetailProgramHeaderProps {
  title: string;
  onPressBack: () => void;
  onPressShare: () => void;
}

export function DetailProgramHeader({
  title,
  onPressBack,
  onPressShare,
}: DetailProgramHeaderProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onPressBack}
        accessibilityRole="button"
        accessibilityLabel="Kembali">
        <Icon icon={ArrowLeft} size={24} color={colors.neutral[900]} />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {title}
      </Text>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onPressShare}
        accessibilityRole="button"
        accessibilityLabel="Bagikan program">
        <Icon icon={Share} size={22} color={colors.neutral[900]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
    backgroundColor: colors.neutral[0],
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
    textAlign: 'center',
  },
});
