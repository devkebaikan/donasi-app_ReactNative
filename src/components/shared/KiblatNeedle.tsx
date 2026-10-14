import React from 'react';
import Svg, {Polygon} from 'react-native-svg';
import {colors} from '@/theme';

interface KiblatNeedleProps {
  size: number;
}

const NEEDLE_RADIUS_RATIO = 0.28; // jarak ujung penunjuk dari pusat piringan
const NEEDLE_HALF_WIDTH = 9;
const NEEDLE_HEIGHT = 14;

// Penunjuk arah kiblat. Digambar mengarah ke atas; sudutnya diatur pemanggil
// lewat putaran container, supaya titik putarnya tepat di pusat piringan.
export function KiblatNeedle({size}: KiblatNeedleProps): React.JSX.Element {
  const center = size / 2;
  const tipY = center - size * NEEDLE_RADIUS_RATIO;
  const baseY = tipY + NEEDLE_HEIGHT;

  return (
    <Svg width={size} height={size}>
      <Polygon
        points={`${center},${tipY} ${center - NEEDLE_HALF_WIDTH},${baseY} ${center + NEEDLE_HALF_WIDTH},${baseY}`}
        fill={colors.primary[600]}
      />
    </Svg>
  );
}
