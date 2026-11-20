export function formatNumberWithSeparator(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatCurrency(amount: number): string {
  return `Rp ${formatNumberWithSeparator(amount)}`;
}

export const formatRupiah = formatCurrency;

const BILLION = 1_000_000_000;
const MILLION = 1_000_000;
const THOUSAND = 1_000;

// Satu angka di belakang koma, koma sebagai pemisah desimal, dan ",0" dibuang
// supaya "Rp 2,0 Juta" jadi "Rp 2 Juta".
function compactPart(value: number, unit: number): string {
  return (value / unit).toFixed(1).replace('.', ',').replace(',0', '');
}

// Nominal ringkas untuk kartu ringkasan dan kartu laporan: 2_300_000 jadi
// "Rp 2,3 Juta", 45_300 jadi "Rp 45,3 Ribu". Nol tetap "Rp 0" — periode tanpa
// aktivitas adalah informasi, bukan kekosongan.
//
// Hanya untuk NOMINAL RUPIAH. Angka orang (peserta, layanan) tetap ditulis
// utuh lewat formatNumberWithSeparator: "200.539 peserta", bukan "200,5 Ribu".
export function formatCompactCurrency(amount: number): string {
  const absolute = Math.abs(amount);
  if (absolute >= BILLION) {
    return `Rp ${compactPart(amount, BILLION)} Miliar`;
  }
  if (absolute >= MILLION) {
    return `Rp ${compactPart(amount, MILLION)} Juta`;
  }
  if (absolute >= THOUSAND) {
    return `Rp ${compactPart(amount, THOUSAND)} Ribu`;
  }
  return `Rp ${Math.round(amount)}`;
}
