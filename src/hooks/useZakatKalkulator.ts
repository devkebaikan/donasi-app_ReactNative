import {useEffect, useMemo, useState} from 'react';
import {getGoldPrice, getZakatCategoryId} from '@/services/zakatService';
import {calculateZakatMaal, calculateZakatPenghasilan} from '@/utils/zakatCalculator';
import {showToast} from '@/utils/toast';
import type {GoldPrice, ZakatCalculatorTab, ZakatPeriode} from '@/types/zakat';

type State = {
  activeTab: ZakatCalculatorTab;
  deposito: number;
  properti: number;
  emas: number;
  saham: number;
  hutang: number;
  penghasilanBulanan: number;
  pendapatanLain: number;
  periodePerhitungan: ZakatPeriode;
  goldPrice: GoldPrice | null;
  isLoadingGoldPrice: boolean;
  zakatCategoryId: number | null;
  nisab: number | null;
  hasilZakat: number | null;
  isWajibZakat: boolean | null;
};

type Actions = {
  setActiveTab: (tab: ZakatCalculatorTab) => void;
  setDeposito: (value: number) => void;
  setProperti: (value: number) => void;
  setEmas: (value: number) => void;
  setSaham: (value: number) => void;
  setHutang: (value: number) => void;
  setPenghasilanBulanan: (value: number) => void;
  setPendapatanLain: (value: number) => void;
  setPeriodePerhitungan: (value: ZakatPeriode) => void;
  calculate: () => void;
};

export function useZakatKalkulator(): State & Actions {
  const [activeTab, setActiveTabState] = useState<ZakatCalculatorTab>('maal');

  const [deposito, setDepositoState] = useState(0);
  const [properti, setPropertiState] = useState(0);
  const [emas, setEmasState] = useState(0);
  const [saham, setSahamState] = useState(0);
  const [hutang, setHutangState] = useState(0);

  const [penghasilanBulanan, setPenghasilanBulananState] = useState(0);
  const [pendapatanLain, setPendapatanLainState] = useState(0);
  const [periodePerhitungan, setPeriodePerhitunganState] =
    useState<ZakatPeriode>('bulanan');

  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [isLoadingGoldPrice, setIsLoadingGoldPrice] = useState(true);
  const [zakatCategoryId, setZakatCategoryId] = useState<number | null>(null);

  const [hasilZakat, setHasilZakat] = useState<number | null>(null);
  const [isWajibZakat, setIsWajibZakat] = useState<boolean | null>(null);

  useEffect(() => {
    async function loadInitialData(): Promise<void> {
      setIsLoadingGoldPrice(true);
      try {
        const [goldPriceResponse, categoryId] = await Promise.all([
          getGoldPrice(),
          getZakatCategoryId(),
        ]);
        if (goldPriceResponse.success) {
          setGoldPrice(goldPriceResponse.data);
        } else {
          showToast(goldPriceResponse.message);
        }
        setZakatCategoryId(categoryId);
      } catch {
        showToast('Tidak dapat terhubung.');
      } finally {
        setIsLoadingGoldPrice(false);
      }
    }
    loadInitialData();
  }, []);

  const nisab = useMemo(() => {
    if (!goldPrice) {
      return null;
    }
    if (activeTab === 'maal') {
      return goldPrice.nisabGrams * goldPrice.pricePerGram;
    }
    const monthlyNisab = (goldPrice.nisabGrams * goldPrice.pricePerGram) / 12;
    return periodePerhitungan === 'pertahun' ? monthlyNisab * 12 : monthlyNisab;
  }, [activeTab, periodePerhitungan, goldPrice]);

  function resetHasil(): void {
    setHasilZakat(null);
    setIsWajibZakat(null);
  }

  function setActiveTab(tab: ZakatCalculatorTab): void {
    setActiveTabState(tab);
    resetHasil();
  }

  function setDeposito(value: number): void {
    setDepositoState(value);
    resetHasil();
  }

  function setProperti(value: number): void {
    setPropertiState(value);
    resetHasil();
  }

  function setEmas(value: number): void {
    setEmasState(value);
    resetHasil();
  }

  function setSaham(value: number): void {
    setSahamState(value);
    resetHasil();
  }

  function setHutang(value: number): void {
    setHutangState(value);
    resetHasil();
  }

  function setPenghasilanBulanan(value: number): void {
    setPenghasilanBulananState(value);
    resetHasil();
  }

  function setPendapatanLain(value: number): void {
    setPendapatanLainState(value);
    resetHasil();
  }

  function setPeriodePerhitungan(value: ZakatPeriode): void {
    setPeriodePerhitunganState(value);
    resetHasil();
  }

  function calculate(): void {
    if (!goldPrice) {
      return;
    }
    const result =
      activeTab === 'maal'
        ? calculateZakatMaal({deposito, properti, emas, saham, hutang}, goldPrice)
        : calculateZakatPenghasilan(
            {penghasilanBulanan, pendapatanLain, periode: periodePerhitungan},
            goldPrice,
          );
    setHasilZakat(result.zakatAmount);
    setIsWajibZakat(result.isWajibZakat);
  }

  return {
    activeTab,
    deposito,
    properti,
    emas,
    saham,
    hutang,
    penghasilanBulanan,
    pendapatanLain,
    periodePerhitungan,
    goldPrice,
    isLoadingGoldPrice,
    zakatCategoryId,
    nisab,
    hasilZakat,
    isWajibZakat,
    setActiveTab,
    setDeposito,
    setProperti,
    setEmas,
    setSaham,
    setHutang,
    setPenghasilanBulanan,
    setPendapatanLain,
    setPeriodePerhitungan,
    calculate,
  };
}
