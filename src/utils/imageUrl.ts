/**
 * Memastikan URL gambar aman untuk didekode oleh Android/iOS.
 * Format .avif di Android 10/11 sering memicu SIGSEGV atau lonjakan memori tak terkontrol
 * di HeifDecoderImpl / libskia. Server CDN beramalbersama menyediakan varian .webp
 * yang jauh lebih stabil dan kompatibel.
 */
export function sanitizeImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  // Ganti .avif dengan .webp
  return url.replace(/\.avif(\?.*)?$/i, '.webp$1');
}

