import React from 'react';
import {G, Circle, Path, Rect, Text as SvgText} from 'react-native-svg';
import {formatNumberWithSeparator} from '@/utils/formatCurrency';
import {
  IMPACT_MARKER_COLOR,
  IMPACT_MARKER_KINDS,
} from '@/screens/impact/impactColors';
import {CALLOUT} from '@/screens/impact/impactCalloutLayout';
import {colors} from '@/theme';
import type {
  ImpactCalloutPlacement,
} from '@/screens/impact/impactCalloutLayout';
import type {ImpactMarkerKind, ImpactProvince} from '@/types/impact';

interface ImpactProvinceCalloutProps {
  stats: ImpactProvince;
  placement: ImpactCalloutPlacement;
  // Titik jangkar di provinsi, dalam satuan viewBox kanvas.
  anchorX: number;
  anchorY: number;
}

function valueOf(stats: ImpactProvince, kind: ImpactMarkerKind): number {
  if (kind === 'participant') {
    return stats.participantCount;
  }
  if (kind === 'village') {
    return stats.villageCount;
  }
  return stats.bummasCount;
}

export function calloutWidth(stats: ImpactProvince): number {
  const items = IMPACT_MARKER_KINDS.map(kind => valueOf(stats, kind)).filter(
    value => value > 0,
  );
  let width = CALLOUT.paddingX * 2;
  items.forEach((value, index) => {
    width +=
      CALLOUT.dotRadius * 2 +
      CALLOUT.gapDotToText +
      formatNumberWithSeparator(value).length *
        CALLOUT.fontSize *
        CALLOUT.charWidthRatio;
    if (index < items.length - 1) {
      width += CALLOUT.gapBetweenItems;
    }
  });
  return width;
}

// Satu provinsi = SATU titik di peta, lalu garis penunjuk ke box berisi
// ketiga angkanya. Mengikuti infografik acuan di design/map.png: angka tidak
// ditumpuk di atas provinsi (di sana tidak terbaca), tapi dipindahkan ke
// ruang kosong di sisi kanvas.
//
// Nilai nol tidak digambar — provinsi yang cuma punya peserta menampilkan satu
// angka saja, seperti Papua di acuan.
export function ImpactProvinceCallout({
  stats,
  placement,
  anchorX,
  anchorY,
}: ImpactProvinceCalloutProps): React.JSX.Element | null {
  const items = IMPACT_MARKER_KINDS.map(kind => ({
    kind,
    value: valueOf(stats, kind),
  })).filter(item => item.value > 0);

  if (items.length === 0) {
    return null;
  }

  const width = calloutWidth(stats);
  const centerY = placement.y + CALLOUT.height / 2;
  // Garis keluar dari sisi box yang MENGHADAP peta: pita atas keluar dari
  // bawah, pita bawah keluar dari atas.
  const lineX = placement.x + width / 2;
  const lineY =
    placement.side === 'above' ? placement.y + CALLOUT.height : placement.y;
  // Siku TUNGGAL: tegak dulu dari box sampai sejajar dengan provinsinya, lalu
  // satu belokan mendatar ke titiknya. Tegak dulu, bukan mendatar dulu, karena
  // box sudah ditaruh kira-kira di atas/bawah provinsinya — ruas tegaknya jadi
  // pendek dan hampir tidak menyilang garis lain.
  // Kalau box tepat di atas provinsinya, ruas mendatarnya nol dan garisnya jadi
  // satu garis tegak — tidak perlu dikasus-khususkan.
  const linePath = `M${lineX} ${lineY} V${anchorY} H${anchorX}`;

  let cursor = placement.x + CALLOUT.paddingX;

  return (
    <G>
      <Path
        d={linePath}
        stroke={colors.neutral[500]}
        strokeWidth={CALLOUT.lineWidth}
        strokeDasharray={CALLOUT.lineDash}
        fill="none"
      />
      <Circle
        cx={anchorX}
        cy={anchorY}
        r={CALLOUT.anchorRadius}
        fill={IMPACT_MARKER_COLOR.participant}
        stroke={colors.neutral[0]}
        strokeWidth={1.4}
      />
      <Rect
        x={placement.x}
        y={placement.y}
        width={width}
        height={CALLOUT.height}
        rx={CALLOUT.height / 2}
        fill={colors.neutral[0]}
        fillOpacity={CALLOUT.boxOpacity}
        stroke={colors.neutral[200]}
      />
      {items.map(item => {
        const label = formatNumberWithSeparator(item.value);
        const dotX = cursor + CALLOUT.dotRadius;
        const textX = dotX + CALLOUT.dotRadius + CALLOUT.gapDotToText;
        cursor +=
          CALLOUT.dotRadius * 2 +
          CALLOUT.gapDotToText +
          label.length * CALLOUT.fontSize * CALLOUT.charWidthRatio +
          CALLOUT.gapBetweenItems;
        return (
          <G key={item.kind}>
            <Circle
              cx={dotX}
              cy={centerY}
              r={CALLOUT.dotRadius}
              fill={IMPACT_MARKER_COLOR[item.kind]}
            />
            <SvgText
              x={textX}
              y={centerY}
              fontSize={CALLOUT.fontSize}
              fontWeight="700"
              alignmentBaseline="middle"
              fill={colors.neutral[800]}>
              {label}
            </SvgText>
          </G>
        );
      })}
    </G>
  );
}
