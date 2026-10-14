// Tiga jenis angka yang tampil di peta, sekaligus tiga baris legenda.
export type ImpactMarkerKind = 'participant' | 'village' | 'bummas';

export interface ImpactProvince {
  // ISO 3166-2:ID, mis. "ID-JB". Dijodohkan dengan `code` di
  // indonesia-map.json. TIDAK ada koordinat di sini — posisi penanda datang
  // dari centroid di file geometri.
  code: string;
  name: string;
  participantCount: number;
  villageCount: number;
  bummasCount: number;
}

export type AsnafSlug =
  | 'miskin'
  | 'fakir'
  | 'fi-sabilillah'
  | 'muallaf'
  | 'gharimin'
  | 'ibnu-sabil';

export interface ImpactAsnafShare {
  slug: AsnafSlug;
  name: string;
  // Persen 0–100 dengan dua desimal, mis. 79.43 → "79,43%" di UI.
  percentage: number;
}

// Penerima manfaat di luar Indonesia. TIDAK punya geometri — dirender sebagai
// pill biasa di bawah kanvas peta, bukan di dalam <Svg>.
export interface ImpactOverseas {
  name: string;
  participantCount: number;
}

export interface ImpactMapData {
  countryName: string;
  participantCount: number;
  serviceCount: number;
  // Sudah jadi, mis. "Mei 2026" — dipakai apa adanya untuk "Data per {…}".
  dataPeriodLabel: string;
  dataNote: string;
  provinces: ImpactProvince[];
  overseas: ImpactOverseas | null;
  asnaf: ImpactAsnafShare[];
}

// Bentuk aset geometri (src/assets/json/indonesia-map.json) — bukan response
// API. Dihasilkan `npm run map:data`, lihat scripts/build-map-data.mjs.
export interface ImpactMapGeometryProvince {
  code: string;
  name: string;
  path: string; // atribut `d`; MultiPolygon jadi beberapa subpath ber-Z
  centroidX: number; // dalam satuan viewBox
  centroidY: number;
}

export interface ImpactMapGeometry {
  viewBox: string; // mis. "0 0 1000 368"
  provinces: ImpactMapGeometryProvince[];
}

// Satu provinsi siap render: geometri + angkanya (kalau ada di response).
export interface ImpactProvinceShape {
  geometry: ImpactMapGeometryProvince;
  stats: ImpactProvince | null;
}

// ─── Laporan penyaluran ────────────────────────────────────────────────────

export type DistributionCategory = 'all' | 'sedekah' | 'wakaf';

export interface ReportPeriod {
  value: string; // "YYYY-MM"
  label: string; // "Juni 2026" — dirakit server, klien tidak memformat ulang
}

export interface DistributionSummary {
  incomingAmount: number;
  distributedAmount: number;
  remainingAmount: number;
  operationalAmount: number;
}

export interface DistributionProgramDetail {
  label: string;
  date: string; // ISO "YYYY-MM-DD"
  amount: number;
}

export interface DistributionProgramReport {
  id: string;
  title: string;
  // Slug kategori untuk menyaring chip. Satu program bisa punya lebih dari
  // satu. Sengaja DIPISAH dari categoryLabels: yang bisa disaring lebih
  // sedikit daripada yang tampil, dan menyatukannya membuat filter ikut
  // berubah setiap server menambah label baru.
  categories: Exclude<DistributionCategory, 'all'>[];
  // Label yang tampil sebagai pill di kartu, mis.
  // ["Sedekah", "Pendidikan", "Kesehatan"].
  categoryLabels: string[];
  collectedAmount: number;
  distributedAmount: number;
  // DIHITUNG SERVER, 0–100. Jangan dihitung ulang di komponen dari
  // collectedAmount dan distributedAmount — pembagi nol dan pembulatan akan
  // beda-beda di tiap tempat.
  distributionPercentage: number;
  // Kosong → kartu tidak bisa dibuka dan chevron-nya tidak dirender.
  details: DistributionProgramDetail[];
}

export interface DistributionReportData {
  period: string; // "YYYY-MM" yang sedang ditampilkan
  periodLabel: string; // "Juni 2026"
  availablePeriods: ReportPeriod[]; // terbaru di atas
  summary: DistributionSummary;
  programs: DistributionProgramReport[];
}
