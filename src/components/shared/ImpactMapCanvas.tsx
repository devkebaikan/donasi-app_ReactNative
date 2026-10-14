import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import Svg, {G, Path, Circle} from 'react-native-svg';
import {ImpactProvinceCallout} from '@/components/shared/ImpactProvinceCallout';
import {
  PROVINCE_FILL_ACTIVE,
  PROVINCE_FILL_INACTIVE,
  PROVINCE_STROKE_ACTIVE,
  PROVINCE_STROKE_INACTIVE,
  IMPACT_MARKER_COLOR,
} from '@/screens/impact/impactColors';
import {
  CALLOUT,
  IMPACT_CALLOUT_PLACEMENTS,
  IMPACT_MAP_CANVAS,
  calloutAnchor,
} from '@/screens/impact/impactCalloutLayout';
import {formatNumberWithSeparator} from '@/utils/formatCurrency';
import {colors, radius} from '@/theme';
import type {ImpactProvinceShape} from '@/types/impact';

interface ImpactMapCanvasProps {
  shapes: ImpactProvinceShape[];
  // Tidak diisi = peta non-interaktif (dipakai di peta layar penuh, di mana
  // tap provinsi tidak membuka apa-apa).
  onSelectProvince?: (code: string) => void;
  // false = hanya titik jangkar per provinsi, tanpa garis dan box. Disediakan
  // supaya versi ringkas bisa dipakai lagi tanpa membongkar komponen.
  showCallouts?: boolean;
}

const STROKE_WIDTH = 0.8;
// Lingkaran transparan di centroid supaya provinsi sempit (DKI, DI Yogyakarta,
// Bali) tetap bisa ditekan. Tidak dibuat sebesar 44dp: pada skala peta itu akan
// menelan provinsi tetangganya. Jalur baca yang benar-benar setara adalah
// "Rincian per Provinsi".
const TOUCH_RADIUS = 24;

function buildLabel(shape: ImpactProvinceShape): string {
  const {stats, geometry} = shape;
  if (!stats) {
    return `${geometry.name}, belum ada program`;
  }
  return (
    `${geometry.name}, ` +
    `${formatNumberWithSeparator(stats.participantCount)} peserta program, ` +
    `${formatNumberWithSeparator(stats.villageCount)} desa berdaya, ` +
    `${formatNumberWithSeparator(stats.bummasCount)} BUMMas`
  );
}

// Peta digambar sebagai vektor, bukan gambar. Geometri datang dari
// src/assets/json/indonesia-map.json (hasil `npm run map:data`), angkanya dari
// API — dijodohkan lewat `code`. Lihat ADR-009.
//
// Kanvas sengaja lebih besar dari petanya: peta diperkecil dan ditaruh di
// tengah, sisi kiri-kanannya jadi ruang box penjelasan. Posisi tiap box statis,
// diatur di impactCalloutLayout.ts.
export function ImpactMapCanvas({
  shapes,
  onSelectProvince,
  showCallouts = true,
}: ImpactMapCanvasProps): React.JSX.Element {
  const {width, height, mapScale, mapX, mapY} = IMPACT_MAP_CANVAS;

  const placementByCode = useMemo(() => {
    const result = new Map<string, (typeof IMPACT_CALLOUT_PLACEMENTS)[number]>();
    for (const placement of IMPACT_CALLOUT_PLACEMENTS) {
      result.set(placement.code, placement);
    }
    return result;
  }, []);

  return (
    <View style={[styles.container, {aspectRatio: width / height}]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        {/* Lapis pertama: bentuk provinsi, digambar dalam koordinat peta. */}
        <G transform={`translate(${mapX},${mapY}) scale(${mapScale})`}>
          {shapes.map(shape => (
            <G
              key={shape.geometry.code}
              onPress={
                onSelectProvince
                  ? () => onSelectProvince(shape.geometry.code)
                  : undefined
              }
              accessibilityRole={onSelectProvince ? 'button' : 'image'}
              accessibilityLabel={buildLabel(shape)}>
              <Path
                d={shape.geometry.path}
                fill={
                  shape.stats ? PROVINCE_FILL_ACTIVE : PROVINCE_FILL_INACTIVE
                }
                stroke={
                  shape.stats
                    ? PROVINCE_STROKE_ACTIVE
                    : PROVINCE_STROKE_INACTIVE
                }
                strokeWidth={STROKE_WIDTH}
              />
              <Circle
                cx={shape.geometry.centroidX}
                cy={shape.geometry.centroidY}
                r={TOUCH_RADIUS}
                fill="transparent"
              />
            </G>
          ))}
        </G>

        {/* Lapis kedua: garis penunjuk + titik + box, digambar dalam koordinat
            KANVAS (bukan koordinat peta) supaya box bisa keluar dari batas
            peta. onPress diulang supaya menekan box sama dengan menekan
            provinsinya. */}
        {shapes.map(shape => {
          const placement = placementByCode.get(shape.geometry.code);
          if (!shape.stats || !placement) {
            return null;
          }
          const anchor = calloutAnchor(shape.geometry);
          return (
            <G
              key={`callout-${shape.geometry.code}`}
              onPress={
                onSelectProvince
                  ? () => onSelectProvince(shape.geometry.code)
                  : undefined
              }
              accessibilityRole={onSelectProvince ? 'button' : 'image'}
              accessibilityLabel={buildLabel(shape)}>
              {showCallouts ? (
                <ImpactProvinceCallout
                  stats={shape.stats}
                  placement={placement}
                  anchorX={anchor.x}
                  anchorY={anchor.y}
                />
              ) : (
                <Circle
                  cx={anchor.x}
                  cy={anchor.y}
                  r={CALLOUT.anchorRadius}
                  fill={IMPACT_MARKER_COLOR.participant}
                  stroke={colors.neutral[0]}
                  strokeWidth={1.4}
                />
              )}
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Tanpa margin sendiri: komponen ini dipakai di halaman DAN di dalam modal
    // layar penuh, dan jarak atas itu urusan pemanggilnya.
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
});
