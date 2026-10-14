// Ejaan API (tipe.name, mis. "INFAK") tidak sama dengan label produk yang
// diinginkan ("Infaq"), jadi mapping eksplisit per slug — bukan transformasi
// string generik. Daftar slug perlu dilengkapi saat tipe baru muncul dari API.
const TYPE_LABEL_BY_SLUG: Record<string, string> = {
  infaq: 'Infaq',
  infak: 'Infaq',
  zakat: 'Zakat',
  wakaf: 'Wakaf',
  sedekah: 'Sedekah',
  qurban: 'Qurban',
};

const FALLBACK_LABEL = 'Donasi';

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|\s)\S/g, character => character.toUpperCase());
}

export function getDonationTypeLabel(
  tipe: {name: string; slug: string} | null | undefined,
): string {
  if (!tipe) {
    return FALLBACK_LABEL;
  }
  const mapped = TYPE_LABEL_BY_SLUG[tipe.slug.toLowerCase()];
  if (mapped) {
    return mapped;
  }
  return tipe.name ? toTitleCase(tipe.name) : FALLBACK_LABEL;
}
