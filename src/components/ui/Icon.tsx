import React from 'react';
import type {SvgProps} from 'react-native-svg';
import {colors} from '@/theme';

export type SolarIconComponent = React.FC<
  {
    size?: number;
    color?: string;
    mirrored?: boolean;
    alt?: string;
  } & Omit<SvgProps, 'width' | 'height'>
>;

type IconProps = {
  icon: SolarIconComponent;
  size?: number;
  color?: string;
  mirrored?: boolean;
  accessibilityLabel?: string;
};

export function Icon({
  icon: IconComponent,
  size = 24,
  color = colors.neutral[900],
  mirrored,
  accessibilityLabel,
}: IconProps): React.JSX.Element {
  return (
    <IconComponent
      size={size}
      color={color}
      mirrored={mirrored}
      alt={accessibilityLabel}
    />
  );
}
