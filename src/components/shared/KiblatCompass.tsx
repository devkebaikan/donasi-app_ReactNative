import React from 'react';
import Svg, {Circle, Text as SvgText} from 'react-native-svg';
import {colors, fontWeight, fontSize} from '@/theme';

interface KiblatCompassProps {
  size: number;
}

interface DialLabel {
  angle: number;
  text: string;
}

const CARDINALS: DialLabel[] = [
  {angle: 0, text: 'Utara'},
  {angle: 90, text: 'Timur'},
  {angle: 180, text: 'Selatan'},
  {angle: 270, text: 'Barat'},
];

const DEGREE_MARKS: DialLabel[] = [30, 60, 120, 150, 210, 240, 300, 330].map(
  angle => ({angle, text: String(angle)}),
);

const LABEL_RADIUS_RATIO = 0.44;
const DEGREE_RADIUS_RATIO = 0.42;
const DOT_RADIUS_RATIO = 0.3;

function pointAt(
  center: number,
  radius: number,
  angleDegrees: number,
): {x: number; y: number} {
  // 0 derajat berada di atas dan bertambah searah jarum jam, mengikuti cara
  // kompas dibaca — bukan konvensi matematika yang mulai dari sumbu x.
  const radians = ((angleDegrees - 90) * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(radians),
    y: center + radius * Math.sin(radians),
  };
}

// Piringan kompas: label mata angin, angka derajat, dan titik penanda. Seluruh
// isinya ikut berputar bersama piringan, jadi teksnya diputar tangensial
// seperti di mockup — Selatan terbaca terbalik saat Utara di atas.
export function KiblatCompass({size}: KiblatCompassProps): React.JSX.Element {
  const center = size / 2;
  const labelRadius = size * LABEL_RADIUS_RATIO;
  const degreeRadius = size * DEGREE_RADIUS_RATIO;
  const dotRadius = size * DOT_RADIUS_RATIO;

  return (
    <Svg width={size} height={size}>
      {CARDINALS.map(({angle, text}) => {
        const position = pointAt(center, labelRadius, angle);
        const dot = pointAt(center, dotRadius, angle);
        return (
          <React.Fragment key={text}>
            <SvgText
              x={position.x}
              y={position.y}
              fill={colors.primary[800]}
              fontSize={fontSize.md}
              fontWeight={fontWeight.bold}
              textAnchor="middle"
              alignmentBaseline="middle"
              transform={`rotate(${angle}, ${position.x}, ${position.y})`}>
              {text}
            </SvgText>
            <Circle cx={dot.x} cy={dot.y} r={4} fill={colors.primary[600]} />
          </React.Fragment>
        );
      })}

      {DEGREE_MARKS.map(({angle, text}) => {
        const position = pointAt(center, degreeRadius, angle);
        const dot = pointAt(center, dotRadius, angle);
        return (
          <React.Fragment key={text}>
            <SvgText
              x={position.x}
              y={position.y}
              fill={colors.neutral[300]}
              fontSize={fontSize.sm}
              fontWeight={fontWeight.medium}
              textAnchor="middle"
              alignmentBaseline="middle"
              transform={`rotate(${angle}, ${position.x}, ${position.y})`}>
              {text}
            </SvgText>
            <Circle cx={dot.x} cy={dot.y} r={3} fill={colors.neutral[300]} />
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
