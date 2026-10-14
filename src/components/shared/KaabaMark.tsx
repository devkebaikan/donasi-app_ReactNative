import React from 'react';
import Svg, {Path, Rect} from 'react-native-svg';
import {colors} from '@/theme';

interface KaabaMarkProps {
  size?: number;
}

// Tidak ada ikon Ka'bah di Solar Icons, jadi digambar sendiri: kubus gelap
// dengan pita kiswah melintang — bentuk yang sama dengan mockup.
export function KaabaMark({size = 40}: KaabaMarkProps): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {/* Badan Ka'bah */}
      <Path
        d="M20 5 L34 11 V29 L20 35 L6 29 V11 Z"
        fill={colors.neutral[800]}
      />
      {/* Sisi kanan lebih terang supaya kubusnya terbaca tiga dimensi */}
      <Path d="M20 20 L34 14 V29 L20 35 Z" fill={colors.neutral[700]} />
      {/* Pita kiswah */}
      <Path d="M6 17 L20 23 L34 17 V21 L20 27 L6 21 Z" fill={colors.primary[400]} />
      {/* Pintu */}
      <Rect x={17.5} y={26} width={5} height={6} rx={1} fill={colors.primary[300]} />
    </Svg>
  );
}
