// Menu Event cuma punya satu halaman: satu poster + satu tombol yang membuka
// halaman pendaftaran di browser. Tidak ada daftar, tidak ada detail, jadi
// tidak ada tipe list di sini. Lihat docs/08-features/event/event.md.
export interface Event {
  id: string;
  // Tidak dirender di layar — seluruh teks event sudah tercetak di dalam
  // poster. Dipakai untuk accessibilityLabel dan teks berbagi, karena teks di
  // dalam gambar tidak terbaca screen reader.
  title: string;
  posterUrl: string;
  // Dimensi asli poster, dipakai menghitung aspectRatio sebelum gambar termuat
  // supaya tidak ada pergeseran layout.
  posterWidth: number;
  posterHeight: number;
  registrationUrl: string;
  // Teks tombol dari penyelenggara, mis. "Daftar Kajiannya".
  ctaLabel: string;
  shareUrl: string;
}
