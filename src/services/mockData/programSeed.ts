// Satu-satunya sumber kebenaran untuk aturan "program ini bisa didonasikan
// rutin". Dipakai DUA jalur yang sebelumnya menghitungnya sendiri-sendiri:
//
//   - daftar program  -> donationService.createMockPrograms()
//   - detail program  -> mockRouter.buildProgramDetail()
//
// Kalau keduanya berbeda pendapat, akan ada program yang muncul di tab
// "Pilihan Rutin" tapi halaman detailnya tidak menampilkan tombol "Donasi
// Rutin" — jalan buntu di tengah alur. Lihat
// docs/08-features/donasi-rutin/README.md.
//
// json-server/middleware.js tidak bisa mengimpor modul TypeScript, jadi kedua
// fungsi ini disalin apa adanya di sana dengan komentar penunjuk ke file ini.

export function seedFromLink(link: string): number {
  let seed = 0;
  for (let i = 0; i < link.length; i += 1) {
    seed = (seed * 31 + link.charCodeAt(i)) % 1000;
  }
  return seed;
}

export function isProgramRutin(seed: number): boolean {
  return seed % 2 === 0;
}
