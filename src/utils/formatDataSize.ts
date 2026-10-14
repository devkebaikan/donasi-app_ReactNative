const KILOBYTE = 1024;

// Ukuran data lokal untuk ditampilkan ke pengguna. Angka desimalnya memakai
// koma, mengikuti penulisan angka Bahasa Indonesia di seluruh aplikasi.
export function formatDataSize(bytes: number): string {
  if (bytes < KILOBYTE) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / KILOBYTE;
  if (kilobytes < KILOBYTE) {
    return `${Math.round(kilobytes)} KB`;
  }

  const megabytes = kilobytes / KILOBYTE;
  return `${megabytes.toFixed(1).replace('.', ',')} MB`;
}
