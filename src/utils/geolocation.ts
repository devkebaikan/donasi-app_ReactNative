export interface Coordinate {
  latitude: number;
  longitude: number;
}

// Adapter satu pintu ke GPS device. Library native-nya BELUM terpasang —
// lihat docs/05-architecture/adr/ADR-004-geolocation-library.md. Selama
// fungsi ini mengembalikan null, semua pemanggil jatuh ke kota default,
// persis seperti perilaku saat izin lokasi ditolak.
//
// Saat library dipilih dan dipasang, cukup isi fungsi ini — tidak ada
// pemanggil yang perlu berubah:
//   1. minta izin lokasi (ACCESS_COARSE_LOCATION / WhenInUse)
//   2. baca posisi dengan enableHighAccuracy: false, timeout 10 detik
//   3. kembalikan null untuk SEMUA kegagalan (ditolak, timeout, GPS mati)
export async function getCurrentCoordinate(): Promise<Coordinate | null> {
  return null;
}
