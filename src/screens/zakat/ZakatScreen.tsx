import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  AltArrowLeft,
  WalletMoney,
  Card,
  Shop,
  CrownLine,
  InfoCircle,
  CheckCircle,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {getNishabData, getZakatProgramSetup, type ZakatSetup} from '@/services/zakatService';
import {formatRupiah} from '@/utils/formatCurrency';
import {showToast} from '@/utils/toast';
import type {ZakatScreenProps} from '@/types/navigation';

type ZakatTypeKey = 'hasil' | 'tabung' | 'dagang' | 'emas';

interface ZakatFields {
  income: number;
  other: number;
  piutang: number;
  utang: number;
  expense: number;
  emas: number;
}

interface ZakatTabItem {
  key: ZakatTypeKey;
  label: string;
  zakatType: number;
  icon: any;
}

const ZAKAT_TABS: ZakatTabItem[] = [
  {key: 'hasil', label: 'Penghasilan', zakatType: 6, icon: WalletMoney},
  {key: 'tabung', label: 'Tabungan', zakatType: 1, icon: Card},
  {key: 'dagang', label: 'Perdagangan', zakatType: 2, icon: Shop},
  {key: 'emas', label: 'Emas', zakatType: 3, icon: CrownLine},
];

export default function ZakatScreen({
  navigation,
}: ZakatScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<ZakatTypeKey>('hasil');
  const [isYearly, setIsYearly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [nishabEmas, setNishabEmas] = useState(2_540_000);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [zakatSetup, setZakatSetup] = useState<ZakatSetup>({
    id: 4,
    link: 'zakatpenghasilan',
  });

  // Fields
  const [fields, setFields] = useState<ZakatFields>({
    income: 0,
    other: 0,
    piutang: 0,
    utang: 0,
    expense: 0,
    emas: 0,
  });

  async function loadData() {
    try {
      const [nishab, setup] = await Promise.all([
        getNishabData(),
        getZakatProgramSetup(),
      ]);
      setNishabEmas(nishab.emasPerGram);
      setUpdatedAt(nishab.updatedAt);
      setZakatSetup(setup);
    } catch {
      // safe fallback
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleRefresh() {
    setIsRefreshing(true);
    loadData();
  }

  function handleTabChange(key: ZakatTypeKey) {
    setActiveTab(key);
    setFields({
      income: 0,
      other: 0,
      piutang: 0,
      utang: 0,
      expense: 0,
      emas: 0,
    });
  }

  function handleFieldChange(name: keyof ZakatFields, text: string) {
    const raw = text.replace(/[^0-9]/g, '');
    const num = raw ? parseInt(raw, 10) : 0;
    setFields(prev => ({...prev, [name]: num}));
  }

  const nishabYearly = nishabEmas * 85;

  const nishabPeriod = useMemo(() => {
    return activeTab === 'hasil' && !isYearly
      ? Math.round(nishabYearly / 12)
      : nishabYearly;
  }, [activeTab, isYearly, nishabYearly]);

  const {total, zakat, isWajib, hasInput} = useMemo(() => {
    let tot = 0;
    if (activeTab === 'hasil') {
      tot = (fields.income || 0) + (fields.other || 0) - (fields.expense || 0);
    } else if (activeTab === 'tabung') {
      tot = (fields.income || 0) - (fields.expense || 0);
    } else if (activeTab === 'dagang') {
      tot =
        (fields.other || 0) +
        (fields.income || 0) +
        (fields.piutang || 0) -
        (fields.utang || 0) -
        (fields.expense || 0);
    } else if (activeTab === 'emas') {
      tot = (fields.emas || 0) * nishabEmas;
    }

    tot = Math.max(0, tot);
    const wajib = tot >= nishabPeriod;
    const zakatNominal = Math.round(tot * 0.025);
    const anyInput = Object.values(fields).some(v => v > 0);

    return {
      total: tot,
      zakat: zakatNominal,
      isWajib: wajib,
      hasInput: anyInput,
    };
  }, [activeTab, fields, nishabEmas, nishabPeriod]);

  function handlePay() {
    if (zakat <= 0) {
      showToast('Silakan masukkan nominal terlebih dahulu');
      return;
    }

    if (isWajib) {
      // Bayar Zakat
      navigation.navigate('AlurDonasi', {
        programId: String(zakatSetup.id || '4'),
        programTitle: 'Zakat Mal & Penghasilan',
        programImageUrl: '',
        programLink: zakatSetup.link || 'zakatpenghasilan',
        preservedAmount: zakat,
      });
    } else {
      // Bayar Infaq
      navigation.navigate('Infak');
    }
  }

  const activeTabMeta = ZAKAT_TABS.find(t => t.key === activeTab) || ZAKAT_TABS[0];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-50">
      {/* Header */}
      <View
        style={{paddingTop: Math.max(insets.top, 12)}}
        className="bg-white px-4 pb-3 flex-row items-center border-b border-gray-100 shadow-xs">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full items-center justify-center bg-gray-50 active:bg-gray-100 mr-2"
          accessibilityLabel="Kembali">
          <Icon icon={AltArrowLeft} size={22} color="#1F2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900">Hitung Zakat</Text>
          <Text className="text-[11px] text-gray-400">
            Kalkulator zakat penghasilan, tabungan, perdagangan, dan emas
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-xs text-gray-400 mt-2">Memuat nishab terbaru...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{padding: 16, paddingBottom: insets.bottom + 100}}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#10B981"
            />
          }>
          {/* Pilih Jenis Zakat */}
          <View className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs mb-3">
            <Text className="text-sm font-bold text-gray-800 mb-3">
              Pilih Jenis Zakat
            </Text>
            <View className="flex-row gap-2">
              {ZAKAT_TABS.map(tab => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => handleTabChange(tab.key)}
                    activeOpacity={0.7}
                    className={`flex-1 items-center py-2.5 px-1 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                        : 'bg-gray-50/70 border-gray-100'
                    }`}>
                    <View
                      className={`w-10 h-10 rounded-xl items-center justify-center mb-1.5 ${
                        isActive ? 'bg-white shadow-xs' : 'bg-gray-100/80'
                      }`}>
                      <Icon
                        icon={tab.icon}
                        size={22}
                        color={isActive ? '#059669' : '#6B7280'}
                      />
                    </View>
                    <Text
                      numberOfLines={1}
                      className={`text-[11px] text-center ${
                        isActive
                          ? 'text-emerald-700 font-bold'
                          : 'text-gray-500 font-medium'
                      }`}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Form Section */}
          <View className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs mb-3 space-y-4">
            <Text className="text-sm font-bold text-gray-800 mb-1">
              Zakat {activeTabMeta?.label || 'Penghasilan'}
            </Text>

            {/* TAB: PENGHASILAN */}
            {activeTab === 'hasil' && (
              <View className="space-y-3.5">
                {/* Frekuensi Tahunan vs Bulanan */}
                <View className="flex-row items-center gap-6 mb-2">
                  <TouchableOpacity
                    onPress={() => setIsYearly(true)}
                    activeOpacity={0.7}
                    className="flex-row items-center gap-2">
                    <View
                      className={`w-4 h-4 rounded-full border items-center justify-center ${
                        isYearly ? 'border-emerald-500' : 'border-gray-300'
                      }`}>
                      {isYearly && (
                        <View className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </View>
                    <Text
                      className={`text-xs ${
                        isYearly ? 'font-bold text-gray-800' : 'text-gray-500'
                      }`}>
                      Tahunan
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setIsYearly(false)}
                    activeOpacity={0.7}
                    className="flex-row items-center gap-2">
                    <View
                      className={`w-4 h-4 rounded-full border items-center justify-center ${
                        !isYearly ? 'border-emerald-500' : 'border-gray-300'
                      }`}>
                      {!isYearly && (
                        <View className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </View>
                    <Text
                      className={`text-xs ${
                        !isYearly ? 'font-bold text-gray-800' : 'text-gray-500'
                      }`}>
                      Bulanan
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Input Penghasilan */}
                <View>
                  <Text className="text-[11px] text-gray-500 mb-1.5 font-medium">
                    Penghasilan {isYearly ? 'Pertahun' : 'Perbulan'}
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="Rp 0"
                    placeholderTextColor="#D1D5DB"
                    value={
                      fields.income > 0 ? fields.income.toLocaleString('id-ID') : ''
                    }
                    onChangeText={t => handleFieldChange('income', t)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-white"
                  />
                </View>

                {/* Input Pendapatan Lain */}
                <View>
                  <Text className="text-[11px] text-gray-500 mb-1.5 font-medium">
                    Pendapatan lain (bonus, THR){' '}
                    <Text className="font-normal text-gray-400">(opsional)</Text>
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="Rp 0"
                    placeholderTextColor="#D1D5DB"
                    value={
                      fields.other > 0 ? fields.other.toLocaleString('id-ID') : ''
                    }
                    onChangeText={t => handleFieldChange('other', t)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-white"
                  />
                </View>

                {/* Input Pengeluaran Pokok */}
                <View>
                  <Text className="text-[11px] text-gray-500 mb-1.5 font-medium">
                    Pengeluaran kebutuhan pokok{' '}
                    <Text className="font-normal text-gray-400">(opsional)</Text>
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="Rp 0"
                    placeholderTextColor="#D1D5DB"
                    value={
                      fields.expense > 0 ? fields.expense.toLocaleString('id-ID') : ''
                    }
                    onChangeText={t => handleFieldChange('expense', t)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-white"
                  />
                </View>
              </View>
            )}

            {/* TAB: TABUNGAN */}
            {activeTab === 'tabung' && (
              <View className="space-y-3.5">
                <View>
                  <Text className="text-[11px] text-gray-500 mb-1.5 font-medium">
                    Saldo tabungan
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="Rp 0"
                    placeholderTextColor="#D1D5DB"
                    value={
                      fields.income > 0 ? fields.income.toLocaleString('id-ID') : ''
                    }
                    onChangeText={t => handleFieldChange('income', t)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-white"
                  />
                </View>
                <View>
                  <Text className="text-[11px] text-gray-500 mb-1.5 font-medium">
                    Bunga bank konvensional{' '}
                    <Text className="font-normal text-gray-400">(opsional)</Text>
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="Rp 0"
                    placeholderTextColor="#D1D5DB"
                    value={
                      fields.expense > 0 ? fields.expense.toLocaleString('id-ID') : ''
                    }
                    onChangeText={t => handleFieldChange('expense', t)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-white"
                  />
                </View>
              </View>
            )}

            {/* TAB: PERDAGANGAN */}
            {activeTab === 'dagang' && (
              <View className="space-y-3.5">
                <View>
                  <Text className="text-[11px] text-gray-500 mb-1.5 font-medium">
                    Modal yang diputar selama 1 tahun
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="Rp 0"
                    placeholderTextColor="#D1D5DB"
                    value={
                      fields.other > 0 ? fields.other.toLocaleString('id-ID') : ''
                    }
                    onChangeText={t => handleFieldChange('other', t)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-white"
                  />
                </View>
                <View>
                  <Text className="text-[11px] text-gray-500 mb-1.5 font-medium">
                    Keuntungan selama 1 tahun
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="Rp 0"
                    placeholderTextColor="#D1D5DB"
                    value={
                      fields.income > 0 ? fields.income.toLocaleString('id-ID') : ''
                    }
                    onChangeText={t => handleFieldChange('income', t)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-white"
                  />
                </View>
                <View>
                  <Text className="text-[11px] text-gray-500 mb-1.5 font-medium">
                    Piutang dagang{' '}
                    <Text className="font-normal text-gray-400">(opsional)</Text>
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="Rp 0"
                    placeholderTextColor="#D1D5DB"
                    value={
                      fields.piutang > 0 ? fields.piutang.toLocaleString('id-ID') : ''
                    }
                    onChangeText={t => handleFieldChange('piutang', t)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-white"
                  />
                </View>
                <View>
                  <Text className="text-[11px] text-gray-500 mb-1.5 font-medium">
                    Utang jatuh tempo{' '}
                    <Text className="font-normal text-gray-400">(opsional)</Text>
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="Rp 0"
                    placeholderTextColor="#D1D5DB"
                    value={
                      fields.utang > 0 ? fields.utang.toLocaleString('id-ID') : ''
                    }
                    onChangeText={t => handleFieldChange('utang', t)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-white"
                  />
                </View>
                <View>
                  <Text className="text-[11px] text-gray-500 mb-1.5 font-medium">
                    Kerugian selama 1 tahun{' '}
                    <Text className="font-normal text-gray-400">(opsional)</Text>
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="Rp 0"
                    placeholderTextColor="#D1D5DB"
                    value={
                      fields.expense > 0 ? fields.expense.toLocaleString('id-ID') : ''
                    }
                    onChangeText={t => handleFieldChange('expense', t)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-white"
                  />
                </View>
              </View>
            )}

            {/* TAB: EMAS */}
            {activeTab === 'emas' && (
              <View className="space-y-3.5">
                <View>
                  <Text className="text-[11px] text-gray-500 mb-1.5 font-medium">
                    Jumlah emas (gram)
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#D1D5DB"
                    value={fields.emas > 0 ? String(fields.emas) : ''}
                    onChangeText={t => handleFieldChange('emas', t)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-white"
                  />
                </View>
                <Text className="text-xs text-gray-500">
                  Harga emas saat ini:{' '}
                  <Text className="font-semibold text-gray-700">
                    {formatRupiah(nishabEmas)}/gram
                  </Text>
                </Text>
              </View>
            )}
          </View>

          {/* Card Hasil Perhitungan */}
          <View className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs mb-3 space-y-3.5">
            <Text className="text-sm font-bold text-gray-800">Hasil Perhitungan</Text>

            {/* Status Badge */}
            <View
              className={`flex-row items-center gap-2 px-3 py-2.5 rounded-xl border ${
                !hasInput
                  ? 'bg-gray-50 border-gray-200'
                  : isWajib
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-amber-50 border-amber-200'
              }`}>
              <View
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  !hasInput
                    ? 'bg-gray-300'
                    : isWajib
                      ? 'bg-emerald-500'
                      : 'bg-amber-400'
                }`}
              />
              <Text
                className={`text-xs ${
                  !hasInput
                    ? 'text-gray-500 font-medium'
                    : isWajib
                      ? 'text-emerald-700 font-bold'
                      : 'text-amber-800 font-medium'
                }`}>
                {!hasInput
                  ? 'Masukkan data untuk melihat status zakat'
                  : isWajib
                    ? 'Wajib membayar zakat'
                    : 'Belum wajib zakat — bisa beralih ke infaq'}
              </Text>
            </View>

            {/* Info Nishab */}
            <View className="space-y-2 pt-1 border-t border-gray-50">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-gray-400">Harga emas per gram</Text>
                <Text className="text-xs font-semibold text-gray-700">
                  {formatRupiah(nishabEmas)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-gray-400">
                  {activeTab === 'hasil' && !isYearly
                    ? 'Nishab 85 gram/bulan'
                    : 'Nishab 85 gram/tahun'}
                </Text>
                <Text className="text-xs font-semibold text-gray-700">
                  {formatRupiah(nishabPeriod)}
                </Text>
              </View>
              {updatedAt && (
                <View className="flex-row items-center justify-between border-t border-dashed border-gray-100 pt-2">
                  <Text className="text-xs text-gray-400">Diperbarui</Text>
                  <Text className="text-xs text-gray-500">
                    {new Date(updatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              )}
            </View>

            {/* Note Bruto (hanya untuk non-dagang) */}
            {activeTab !== 'dagang' && (
              <View className="flex-row items-center gap-2 bg-amber-50 rounded-xl px-3 py-2 border border-amber-100/60">
                <Icon icon={InfoCircle} size={15} color="#D97706" />
                <Text className="text-[11px] text-amber-700 flex-1">
                  Dianjurkan dihitung dari penghasilan bruto sebelum potongan
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Fixed Bottom Bar */}
      <View
        style={{paddingBottom: Math.max(insets.bottom, 12)}}
        className="bg-white border-t border-gray-100 px-5 pt-3 flex-row items-center justify-between shadow-lg">
        <View className="flex-1 mr-3">
          <Text className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            {isWajib ? 'Total Zakat (2.5%)' : 'Infaq'}
          </Text>
          <Text className="text-base font-extrabold text-gray-900 mt-0.5">
            {formatRupiah(hasInput ? zakat : 0)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handlePay}
          disabled={!hasInput || zakat <= 0}
          activeOpacity={0.8}
          className={`py-3.5 px-6 rounded-xl flex-row items-center justify-center shadow-xs ${
            !hasInput || zakat <= 0
              ? 'bg-gray-300 opacity-70'
              : isWajib
                ? 'bg-emerald-600 active:bg-emerald-700'
                : 'bg-amber-600 active:bg-amber-700'
          }`}>
          <Text className="text-sm font-bold text-white">
            {isWajib ? 'Bayar Zakat' : 'Bayar Infaq'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
