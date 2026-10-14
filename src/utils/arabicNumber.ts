// Digit Arabic-Indic (U+0660..U+0669), yang dipakai penomoran ayat di mushaf.
const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Mengubah angka jadi digit arab: 45 -> ٤٥.
 *
 * Hanya untuk teks yang DILIHAT. Jangan dipakai di `accessibilityLabel` —
 * screen reader berbahasa Indonesia akan mengeja digit arab dengan salah,
 * jadi label tetap memakai angka latin.
 */
export function toArabicNumber(value: number): string {
  return String(Math.trunc(Math.abs(value)))
    .split('')
    .map(digit => ARABIC_INDIC_DIGITS[Number(digit)] ?? digit)
    .join('');
}
