import type {ImpactMapGeometry} from '@/types/impact';

// Tata letak box penjelasan di peta — STATIS per provinsi, bukan hasil
// perhitungan tata letak otomatis saat render. Disimpan sebagai tabel supaya
// posisinya bisa digeser satu per satu tanpa menyentuh logika render.
//
// Box disusun sebagai PITA BARIS di atas dan di bawah peta, bukan kolom di
// kiri-kanan. Susunan kolom sempat dipakai dan hasilnya menutupi bagian tengah
// peta di sisi kiri dan kanan — justru wilayah yang paling banyak datanya.
//
// Dalam tiap pita, box diurutkan dari barat ke timur mengikuti urutan
// provinsinya. Urutan geografis itu yang membuat garis penunjuk hampir tegak
// lurus dan jarang saling menyilang.

// mapScale/mapX/mapY di bawah mengasumsikan geometri ber-viewBox 1000x368
// (keluaran `npm run map:data` saat ini). Kalau peta di-generate ulang dengan
// proyeksi atau ukuran berbeda, tata letak box di bawah HARUS ditinjau ulang —
// posisinya statis dan tidak ikut menyesuaikan sendiri.
export const IMPACT_MAP_CANVAS = {
  width: 1000,
  height: 646,
  // Peta diperkecil dan digeser ke tengah; pita atas dan bawah untuk box.
  mapScale: 0.86,
  mapX: 70,
  mapY: 144,
} as const;

export interface ImpactCalloutPlacement {
  code: string;
  // Sudut kiri-atas box, dalam satuan viewBox kanvas.
  x: number;
  y: number;
  // Pita tempat box berada. Menentukan sisi mana garis penunjuk keluar:
  // 'above' keluar dari sisi bawah box, 'below' dari sisi atasnya.
  side: 'above' | 'below';
}

export const IMPACT_CALLOUT_PLACEMENTS: ImpactCalloutPlacement[] = [
  {code: 'ID-AC', x: 47, y: 8, side: 'above'}, // Aceh
  {code: 'ID-SU', x: 232, y: 8, side: 'above'}, // Sumatera Utara
  {code: 'ID-SB', x: 426, y: 8, side: 'above'}, // Sumatera Barat
  {code: 'ID-RI', x: 611, y: 8, side: 'above'}, // Riau
  {code: 'ID-JA', x: 796, y: 8, side: 'above'}, // Jambi
  {code: 'ID-KR', x: 18, y: 50, side: 'above'}, // Kepulauan Riau
  {code: 'ID-KB', x: 134, y: 50, side: 'above'}, // Kalimantan Barat
  {code: 'ID-KT', x: 319, y: 50, side: 'above'}, // Kalimantan Tengah
  {code: 'ID-KI', x: 484, y: 50, side: 'above'}, // Kalimantan Timur
  {code: 'ID-ST', x: 669, y: 50, side: 'above'}, // Sulawesi Tengah
  {code: 'ID-SA', x: 864, y: 50, side: 'above'}, // Sulawesi Utara
  {code: 'ID-MU', x: 426, y: 92, side: 'above'}, // Maluku Utara
  {code: 'ID-BE', x: 62, y: 478, side: 'below'}, // Bengkulu
  {code: 'ID-SS', x: 217, y: 478, side: 'below'}, // Sumatera Selatan
  {code: 'ID-LA', x: 402, y: 478, side: 'below'}, // Lampung
  {code: 'ID-BB', x: 596, y: 478, side: 'below'}, // Kepulauan Bangka Belitung
  {code: 'ID-BT', x: 762, y: 478, side: 'below'}, // Banten
  {code: 'ID-JK', x: 80, y: 520, side: 'below'}, // DKI Jakarta
  {code: 'ID-JB', x: 285, y: 520, side: 'below'}, // Jawa Barat
  {code: 'ID-JT', x: 499, y: 520, side: 'below'}, // Jawa Tengah
  {code: 'ID-YO', x: 723, y: 520, side: 'below'}, // DI Yogyakarta
  {code: 'ID-JI', x: 22, y: 562, side: 'below'}, // Jawa Timur
  {code: 'ID-BA', x: 237, y: 562, side: 'below'}, // Bali
  {code: 'ID-KS', x: 421, y: 562, side: 'below'}, // Kalimantan Selatan
  {code: 'ID-NB', x: 606, y: 562, side: 'below'}, // Nusa Tenggara Barat
  {code: 'ID-SN', x: 791, y: 562, side: 'below'}, // Sulawesi Selatan
  {code: 'ID-NT', x: 135, y: 604, side: 'below'}, // Nusa Tenggara Timur
  {code: 'ID-SG', x: 300, y: 604, side: 'below'}, // Sulawesi Tenggara
  {code: 'ID-MA', x: 485, y: 604, side: 'below'}, // Maluku
  {code: 'ID-PB', x: 630, y: 604, side: 'below'}, // Papua Barat
  {code: 'ID-PA', x: 747, y: 604, side: 'below'}, // Papua
];

// Ukuran box dan isinya, dalam satuan viewBox kanvas.
export const CALLOUT = {
  fontSize: 17,
  dotRadius: 5.5,
  paddingX: 12,
  gapDotToText: 5,
  gapBetweenItems: 13,
  height: 34,
  // Svg tidak bisa mengukur teks, jadi lebar box diperkirakan dari jumlah
  // karakter. Rasio ini hasil pencocokan dengan render sebenarnya.
  charWidthRatio: 0.58,
  anchorRadius: 5.5,
  lineWidth: 1.1,
  // Garis putus-putus, dalam satuan viewBox kanvas. Pada lebar layar ponsel
  // (skala ~0.36) ini jadi strip ~2dp dengan sela ~1.4dp — masih terbaca
  // sebagai garis putus, tidak melebur jadi garis penuh.
  lineDash: '6 4',
  // Box sedikit tembus pandang supaya peta dan garis di belakangnya tidak
  // hilang tertutup. Jangan diturunkan jauh di bawah ini: angkanya mulai
  // beradu dengan daratan di belakangnya dan jadi sulit dibaca.
  boxOpacity: 0.85,
} as const;

// Titik jangkar satu provinsi pada kanvas (centroid geometri, ikut skala peta).
export function calloutAnchor(
  geometry: ImpactMapGeometry['provinces'][number],
): {x: number; y: number} {
  return {
    x: geometry.centroidX * IMPACT_MAP_CANVAS.mapScale + IMPACT_MAP_CANVAS.mapX,
    y: geometry.centroidY * IMPACT_MAP_CANVAS.mapScale + IMPACT_MAP_CANVAS.mapY,
  };
}
