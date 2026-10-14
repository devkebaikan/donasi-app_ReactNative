import React from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

interface SeeMoreOverlayProps {
  label: string;
  onPress: () => void;
}

export function SeeMoreOverlay({
  label,
  onPress,
}: SeeMoreOverlayProps): React.JSX.Element {
  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0)', colors.neutral[0]]}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
      style={styles.gradient}
      pointerEvents="box-none">
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.lg,
  },
  button: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
});
