export type ZakatCalculatorTab = 'maal' | 'penghasilan';

export type ZakatPeriode = 'bulanan' | 'pertahun';

export interface GoldPrice {
  pricePerGram: number;
  nisabGrams: number;
}

export interface ZakatMaalInput {
  deposito: number;
  properti: number;
  emas: number;
  saham: number;
  hutang: number;
}

export interface ZakatPenghasilanInput {
  penghasilanBulanan: number;
  pendapatanLain: number;
  periode: ZakatPeriode;
}

export interface ZakatCalculationResult {
  nisab: number;
  isWajibZakat: boolean;
  zakatAmount: number;
}
