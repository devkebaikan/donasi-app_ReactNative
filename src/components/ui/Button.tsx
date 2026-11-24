import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';

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
  className?: string;
  style?: StyleProp<ViewStyle>;
}

// Icon mengikuti warna label supaya tidak perlu dioper per pemakaian.
const ICON_COLOR: Record<ButtonVariant, string> = {
  primary: '#FFFFFF',
  secondary: '#111827',
  ghost: '#1EB8B1',
  outline: '#1EB8B1',
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

const VARIANT_CONTAINER: Record<ButtonVariant, string> = {
  primary: 'bg-secondary-600/85',
  secondary: 'bg-neutral-100 border border-neutral-200',
  ghost: 'bg-transparent border border-primary-500',
  outline: 'bg-white border border-primary-500',
};

const VARIANT_LABEL: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-neutral-900',
  ghost: 'text-primary-500',
  outline: 'text-primary-500',
};

const SIZE_CONTAINER: Record<ButtonSize, string> = {
  xs: 'min-h-[32px] py-1 px-2',
  smWide: 'min-h-[30px] py-1 px-6',
  sm: 'min-h-[40px] py-1 px-3',
  md: 'min-h-[40px] py-1 px-3',
  lg: 'min-h-[44px] py-3 px-6',
};

const SIZE_LABEL: Record<ButtonSize, string> = {
  xs: 'text-xs',
  smWide: 'text-sm',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base',
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
  className = '',
  style,
}: ButtonProps): React.JSX.Element {
  // Warna dynamic cuma dipakai variant outline (border + label + icon);
  // variant primary memakainya sebagai background.
  const outlineColor = variant === 'outline' && color ? color : null;
  const iconColor = outlineColor ?? ICON_COLOR[variant];

  const labelNode = (
    <Text
      className={`font-semibold ${SIZE_LABEL[size]} ${VARIANT_LABEL[variant]}`}
      style={outlineColor ? {color: outlineColor} : undefined}>
      {label}
    </Text>
  );

  return (
    <TouchableOpacity
      className={`items-center justify-center rounded-lg ${VARIANT_CONTAINER[variant]} ${SIZE_CONTAINER[size]} ${
        isDisabled || isLoading ? 'opacity-50' : ''
      } ${className}`}
      style={[
        variant === 'primary' && color ? {backgroundColor: color} : undefined,
        outlineColor ? {borderColor: outlineColor} : undefined,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled || isLoading}
      activeOpacity={0.7}
      hitSlop={HIT_SLOP[size]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{disabled: isDisabled || isLoading, busy: isLoading}}>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary'
              ? '#FFFFFF'
              : outlineColor ?? '#1EB8B1'
          }
        />
      ) : icon ? (
        <View className="flex-row items-center gap-2">
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
