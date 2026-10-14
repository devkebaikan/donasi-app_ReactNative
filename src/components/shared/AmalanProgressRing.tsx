import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';
import {colors, fontWeight, fontSize} from '@/theme';

interface AmalanProgressRingProps {
  percentage: number;
  size?: number;
}

const DEFAULT_SIZE = 88;
const STROKE_WIDTH = 10;

// Disalin dari DonasiRekapPieChart — bedanya di sini yang digambar busur cincin
// (stroke, tidak menutup ke titik pusat), bukan potongan pie.
function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): {x: number; y: number} {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad)};
}

function describeArcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

export function AmalanProgressRing({
  percentage,
  size = DEFAULT_SIZE,
}: AmalanProgressRingProps): React.JSX.Element {
  const safePercentage = Math.max(0, Math.min(100, Math.floor(percentage)));
  const center = size / 2;
  const radius = center - STROKE_WIDTH / 2;
  // 100% tidak bisa digambar dengan satu arc: titik awal dan akhirnya berimpit
  // sehingga SVG menggambar busur nol derajat — cincin tampak kosong tepat saat
  // paling ingin dilihat penuh. Lingkaran penuh dipakai sebagai gantinya.
  const isFull = safePercentage >= 100;

  return (
    <View
      style={{width: size, height: size}}
      accessible={false}
      importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.neutral[200]}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {isFull ? (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.primary[500]}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
        ) : safePercentage > 0 ? (
          <Path
            d={describeArcPath(
              center,
              center,
              radius,
              0,
              safePercentage * 3.6,
            )}
            stroke={colors.primary[500]}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
          />
        ) : null}
      </Svg>
      <View style={[styles.labelWrapper, {width: size, height: size}]}>
        <Text style={styles.label}>{safePercentage}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
    color: colors.neutral[900],
  },
});
