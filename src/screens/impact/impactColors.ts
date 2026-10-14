import {colors} from '@/theme';
import type {ImpactMarkerKind} from '@/types/impact';

// Warna tiga jenis angka di peta. Didefinisikan SEKALI di sini supaya penanda,
// legenda, dan sheet provinsi tidak pernah berselisih warna.
export const IMPACT_MARKER_COLOR: Record<ImpactMarkerKind, string> = {
  participant: colors.secondary[500],
  village: colors.semantic.warning,
  bummas: colors.semantic.info,
};

export const IMPACT_MARKER_LABEL: Record<ImpactMarkerKind, string> = {
  participant: 'Peserta Program',
  village: 'Desa Berdaya',
  bummas: 'BUMMas',
};

// Urutan tetap — dipakai penanda, legenda, dan daftar rincian.
export const IMPACT_MARKER_KINDS: ImpactMarkerKind[] = [
  'participant',
  'village',
  'bummas',
];

// Dua keadaan saja, bukan choropleth bergradasi: warna bergradasi tidak
// terbaca di provinsi sekecil DKI pada lebar layar ponsel.
export const PROVINCE_FILL_ACTIVE = colors.secondary[100];
export const PROVINCE_STROKE_ACTIVE = colors.secondary[300];
export const PROVINCE_FILL_INACTIVE = colors.neutral[100];
export const PROVINCE_STROKE_INACTIVE = colors.neutral[300];
