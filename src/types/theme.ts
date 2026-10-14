// Konten tema donasi — satu halaman gambar penuh + satu tombol, konsepnya
// sama dengan menu Event. Lihat docs/08-features/donasi/per-tema.md.
//
// Nama `Theme` di sini adalah konten kampanye dari API, bukan design token di
// `@/theme` — keduanya tidak pernah dipakai di file yang sama.
export type ThemeCtaType = 'web' | 'program';

export interface Theme {
  id: string;
  // Tidak dirender di layar — seluruh teks tema sudah tercetak di dalam
  // gambar. Dipakai untuk accessibilityLabel dan teks berbagi, karena teks di
  // dalam gambar tidak terbaca screen reader.
  title: string;
  description: string;
  imageUrl: string;
  ctaLabel: string;
  // 'web' → buka ctaTarget di browser. 'program' → ctaTarget adalah `link`
  // program, dibuka di DetailProgramScreen.
  ctaType: ThemeCtaType;
  ctaTarget: string;
  shareUrl: string;
}
