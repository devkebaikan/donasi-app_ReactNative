import type {
  GoldPrice,
  ZakatCalculationResult,
  ZakatMaalInput,
  ZakatPenghasilanInput,
} from '@/types/zakat';

const ZAKAT_RATE = 0.025;

export function calculateZakatMaal(
  input: ZakatMaalInput,
  goldPrice: GoldPrice,
): ZakatCalculationResult {
  const totalHarta =
    input.deposito + input.properti + input.emas + input.saham - input.hutang;
  const nisab = goldPrice.nisabGrams * goldPrice.pricePerGram;
  const isWajibZakat = totalHarta >= nisab;

  return {
    nisab,
    isWajibZakat,
    zakatAmount: isWajibZakat ? totalHarta * ZAKAT_RATE : 0,
  };
}

export function calculateZakatPenghasilan(
  input: ZakatPenghasilanInput,
  goldPrice: GoldPrice,
): ZakatCalculationResult {
  const monthlyNisab = (goldPrice.nisabGrams * goldPrice.pricePerGram) / 12;
  const isPerTahun = input.periode === 'pertahun';
  const periodeMultiplier = isPerTahun ? 12 : 1;

  const totalPenghasilan =
    (input.penghasilanBulanan + input.pendapatanLain) * periodeMultiplier;
  const nisab = monthlyNisab * periodeMultiplier;
  const isWajibZakat = totalPenghasilan >= nisab;

  return {
    nisab,
    isWajibZakat,
    zakatAmount: isWajibZakat ? totalPenghasilan * ZAKAT_RATE : 0,
  };
}
