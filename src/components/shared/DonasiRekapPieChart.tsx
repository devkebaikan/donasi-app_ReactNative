import React from 'react';
import {View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';
import {colors} from '@/theme';

export interface DonasiRekapChartSlice {
  label: string;
  value: number;
}

interface DonasiRekapPieChartProps {
  data: DonasiRekapChartSlice[];
  size?: number;
}

const SLICE_COLORS = [
  colors.primary[500],
  colors.secondary[500],
  colors.semantic.info,
  colors.semantic.warning,
  colors.semantic.success,
  colors.neutral[400],
];

const DEFAULT_SIZE = 160;

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): {x: number; y: number} {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad)};
}

function describeSlicePath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}

export function DonasiRekapPieChart({
  data,
  size = DEFAULT_SIZE,
}: DonasiRekapPieChartProps): React.JSX.Element {
  const radius = size / 2;
  const nonZeroSlices = data.filter(slice => slice.value > 0);
  const total = nonZeroSlices.reduce((sum, slice) => sum + slice.value, 0);

  if (total <= 0) {
    return (
      <View accessibilityRole="image" accessibilityLabel="Belum ada data donasi">
        <Svg width={size} height={size}>
          <Circle cx={radius} cy={radius} r={radius} fill={colors.neutral[200]} />
        </Svg>
      </View>
    );
  }

  if (nonZeroSlices.length === 1) {
    const onlySliceLabel = nonZeroSlices[0]?.label ?? '';
    return (
      <View
        accessibilityRole="image"
        accessibilityLabel={`${onlySliceLabel} 100 persen`}>
        <Svg width={size} height={size}>
          <Circle cx={radius} cy={radius} r={radius} fill={SLICE_COLORS[0]} />
        </Svg>
      </View>
    );
  }

  let cumulativeAngle = 0;
  const slices = nonZeroSlices.map((slice, index) => {
    const angle = (slice.value / total) * 360;
    const path = describeSlicePath(
      radius,
      radius,
      radius,
      cumulativeAngle,
      cumulativeAngle + angle,
    );
    cumulativeAngle += angle;
    return {
      key: `${slice.label}-${index}`,
      path,
      color: SLICE_COLORS[Math.min(index, SLICE_COLORS.length - 1)],
    };
  });

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={nonZeroSlices
        .map(
          slice =>
            `${slice.label} ${Math.round((slice.value / total) * 100)} persen`,
        )
        .join(', ')}>
      <Svg width={size} height={size}>
        {slices.map(slice => (
          <Path
            key={slice.key}
            d={slice.path}
            fill={slice.color}
            stroke={colors.neutral[0]}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        ))}
      </Svg>
    </View>
  );
}
