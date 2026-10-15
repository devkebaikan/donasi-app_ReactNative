import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';
import {colors, colorTokens, spacing, radius, fontSize, fontWeight} from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'xs' | 'smWide' | 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  /** Override warna dynamic dari API (mis. `ctaColor` di detail program).
   * variant="primary" → warna background. variant="outline" → warna border,
   * label, dan icon. Variant lain mengabaikannya. */
  color?: string;
  /** Icon opsional di kiri label. Warnanya otomatis mengikuti warna label per variant. */
  icon?: SolarIconComponent;
  /** Override label untuk screen reader. Default: `label`. Dipakai saat teks
   * tombol saja tidak cukup menjelaskan aksinya — mis. "Daftar Kajiannya" yang
   * butuh menyebut nama event-nya. */
  accessibilityLabel?: string;
}

// Icon mengikuti warna label supaya tidak perlu dioper per pemakaian.
const ICON_COLOR: Record<ButtonVariant, string> = {
  primary: colors.neutral[0],
  secondary: colorTokens.text.primary,
  ghost: colors.primary[500],
  outline: colors.primary[500],
};

const ICON_SIZE: Record<ButtonSize, number> = {
  xs: 14,
  smWide: 16,
  sm: 16,
  md: 18,
  lg: 20,
};

// size="xs" dan size="smWide" divisualkan di bawah 44px, jadi touch target
// 44x44 dijaga lewat hitSlop (bukan minHeight) — lihat juga
// docs/03-ui-standards/accessibility.md.
const XS_HIT_SLOP = {top: 8, bottom: 8, left: 8, right: 8};
const SM_WIDE_HIT_SLOP = {top: 2, bottom: 2, left: 0, right: 0};

const HIT_SLOP: Partial<Record<ButtonSize, typeof XS_HIT_SLOP>> = {
  xs: XS_HIT_SLOP,
  smWide: SM_WIDE_HIT_SLOP,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  color,
  icon,
  accessibilityLabel,
}: ButtonProps): React.JSX.Element {
  // Warna dynamic cuma dipakai variant outline (border + label + icon);
  // variant primary memakainya sebagai background.
  const outlineColor = variant === 'outline' && color ? color : null;
  const iconColor = outlineColor ?? ICON_COLOR[variant];

  const labelNode = (
    <Text
      style={[
        styles.label,
        size === 'xs' && styles.xsLabel,
        styles[`${variant}Label`],
        outlineColor ? {color: outlineColor} : null,
      ]}>
      {label}
    </Text>
  );

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        variant === 'primary' && color ? {backgroundColor: color} : null,
        outlineColor ? {borderColor: outlineColor} : null,
        (isDisabled || isLoading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled || isLoading}
      hitSlop={HIT_SLOP[size]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{disabled: isDisabled || isLoading, busy: isLoading}}>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary'
              ? colors.neutral[0]
              : outlineColor ?? colors.primary[500]
          }
        />
      ) : icon ? (
        // Hanya dibungkus row saat ada icon — tombol tanpa icon tetap
        // merender <Text> langsung seperti sebelumnya, jadi tidak ada
        // pemakaian existing yang berubah tampilannya.
        <View style={styles.content}>
          <Icon
            icon={icon}
            size={ICON_SIZE[size]}
            color={iconColor}
          />
          {labelNode}
        </View>
      ) : (
        labelNode
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  primary: {
    backgroundColor: colors.secondary[500],
  },
  secondary: {
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colorTokens.border.default,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  // Sama dengan ghost, tapi background putih solid — dipakai di atas footer
  // atau kartu yang latarnya tidak putih.
  outline: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  xs: {minHeight: 32, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm},
  // Tombol aksi di header kartu (Saldo Kebaikan di Home, Saku Berbagi di form
  // donasi rutin): sedikit lebih pendek dari `sm` tapi lebih lebar.
  smWide: {
    minHeight: 30,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  sm: {paddingVertical: spacing.xs, paddingHorizontal: spacing.md},
  md: {paddingVertical: spacing.sm, paddingHorizontal: spacing.lg},
  lg: {paddingVertical: spacing.md, paddingHorizontal: spacing.xl},
  disabled: {opacity: 0.5},
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
  },
  xsLabel: {fontSize: fontSize.xs},
  primaryLabel: {color: colors.neutral[0]},
  secondaryLabel: {color: colorTokens.text.primary},
  ghostLabel: {color: colors.primary[500]},
  outlineLabel: {color: colors.primary[500]},
});
