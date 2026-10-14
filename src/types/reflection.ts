// Renungan berupa poster gambar, bukan artikel — seluruh teksnya sudah
// tercetak di dalam gambar. Karena itu tidak ada field konten HTML di sini;
// `title` tetap dikirim untuk accessibilityLabel dan judul di screen detail.
// Lihat docs/08-features/renungan/README.md.
export interface Reflection {
  id: string;
  title: string;
  imageUrl: string;
  publishedAt: string; // ISO — dipakai untuk urutan, tidak dirender di UI
}

export interface ReflectionDetail extends Reflection {
  shareUrl: string;
  imageWidth: number;
  imageHeight: number;
}
