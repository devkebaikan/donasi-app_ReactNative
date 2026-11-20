import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {
  AltArrowLeft,
  QrCode,
  UsersGroupTwoRounded,
  HandHeart,
  Card,
  User,
  Heart,
  InfoCircle,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {MetodePembayaranBottomSheet} from '@/components/shared/MetodePembayaranBottomSheet';
import {
  getInfakQrCode,
  getInfakDonors,
  getInfakPaymentMethods,
  getInfakProgramSetup,
  submitInfakTransaction,
  type InfakQrData,
  type InfakDonor,
} from '@/services/infakService';
import {useAuthStore} from '@/stores/authStore';
import {formatRupiah} from '@/utils/formatCurrency';
import {showToast} from '@/utils/toast';
import type {InfakScreenProps} from '@/types/navigation';
import type {PaymentMethod} from '@/types/payment';

const NOMINAL_OPTIONS = [10_000, 25_000, 50_000, 100_000];

export default function InfakScreen({
  navigation,
  route,
}: InfakScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const methodSheetRef = useRef<BottomSheetModal>(null);

  const initialAmount = route.params?.initialAmount ?? 0;

  const authUser = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => Boolean(s.accessToken));
  const walletBalance = authUser?.dompet_kebaikan?.saldo ?? 0;
  const isLoadingWallet = false;

  // Tabs
  const [activeTab, setActiveTab] = useState<'online' | 'qr' | 'donatur'>('online');

  // Form State
  const [amount, setAmount] = useState<number>(initialAmount);
  const [infaqId, setInfaqId] = useState<number>(399);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState<boolean>(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  // Guest & User Fields
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [doa, setDoa] = useState<string>('');
  const [isForOther, setIsForOther] = useState<boolean>(false);
  const [otherName, setOtherName] = useState<string>('');

  // QR & Donors State
  const [qrData, setQrData] = useState<InfakQrData | null>(null);
  const [donors, setDonors] = useState<InfakDonor[]>([]);
  const [isLoadingDonors, setIsLoadingDonors] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function loadInitialData() {
    try {
      setIsLoadingMethods(true);
      const [methods, pId, qr, donorList] = await Promise.all([
        getInfakPaymentMethods(),
        getInfakProgramSetup(),
        getInfakQrCode(),
        getInfakDonors(15),
      ]);
      setPaymentMethods(methods);
      setInfaqId(pId);
      setQrData(qr);
      setDonors(donorList);

      if (methods.length > 0 && !selectedMethod) {
        // Pilih default Syariah/BSI atau metode pertama
        const defaultM =
          methods.find(m => m.name.toLowerCase().includes('bsi') || m.name.toLowerCase().includes('syariah')) ||
          methods[0];
        setSelectedMethod(defaultM || null);
      }
    } catch {
      // Safe fallback
    } finally {
      setIsLoadingMethods(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadInitialData();
  }

  function handleSelectPreset(val: number) {
    setAmount(val);
  }

  function handleAmountChange(text: string) {
    const raw = text.replace(/[^0-9]/g, '');
    const num = raw ? parseInt(raw, 10) : 0;
    setAmount(num);
  }

  function handleOpenMethodModal() {
    methodSheetRef.current?.present();
  }

  function handleSelectPaymentMethod(method: PaymentMethod) {
    setSelectedMethod(method);
    methodSheetRef.current?.dismiss();
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    if (amount < 1000) {
      showToast('Minimal infaq Rp1.000');
      return;
    }

    if (!selectedMethod) {
      showToast('Pilih metode pembayaran terlebih dahulu');
      return;
    }

    const name = isAuthenticated
      ? authUser?.name || 'Sahabat Kebaikan'
      : isAnonymous
        ? 'Hamba Allah'
        : guestName.trim();

    const phone = isAuthenticated
      ? authUser?.phone || ''
      : guestPhone.trim();

    if (!isAuthenticated && (!name || !phone)) {
      showToast('Nama dan nomor WhatsApp wajib diisi');
      return;
    }

    if (isForOther && !otherName.trim()) {
      showToast('Masukkan nama orang yang diniatkan');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitInfakTransaction({
        infaqId,
        amount,
        paymentMethodId: selectedMethod.id,
        name,
        phone,
        doa: doa.trim() || undefined,
        atas_nama: isForOther ? otherName.trim() : undefined,
        is_anonymous: isAnonymous ? 1 : 0,
      });

      navigation.replace('PaymentInvoice', {
        donationId: res.donationId,
        invoiceId: res.invoiceId,
        paymentMethod: selectedMethod.name,
        bankName: selectedMethod.name,
        accountNumber: res.accountNumber || selectedMethod.account_number,
        amount: res.amount,
        adminFee: res.adminFee,
        totalAmount: res.totalAmount,
        expiredAt: res.expiredAt || '',
      });
    } catch (err: any) {
      showToast(err?.message || 'Gagal memproses infaq, silakan coba lagi');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isWallet =
    selectedMethod?.type === 'wallet' ||
    selectedMethod?.type === 'dompet_kebaikan';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-50">
      {/* Header */}
      <View
        style={{paddingTop: Math.max(insets.top, 12)}}
        className="bg-white px-4 pb-3 flex-row items-center border-b border-gray-100 shadow-xs z-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full items-center justify-center bg-gray-50 active:bg-gray-100 mr-2"
          accessibilityLabel="Kembali">
          <Icon icon={AltArrowLeft} size={22} color="#1F2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900">Infak</Text>
          <Text className="text-[11px] text-gray-400">
            Tunaikan infaq Anda secara online di Beramalbersama.com
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{paddingBottom: insets.bottom + 100}}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#10B981"
          />
        }>
        {/* Hero Banner */}
        <View className="w-full aspect-[16/7] bg-emerald-700 overflow-hidden relative">
          <Image
            source={{
              uri:
                'https://cdn.aksiberbagi.com/settings/home-banner-1777532258.jpeg',
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Tab Navigation */}
        <View className="bg-white flex-row border-b border-gray-100 shadow-xs">
          {[
            {id: 'online', label: 'Infaq Online', icon: HandHeart},
            {id: 'qr', label: 'QR Code', icon: QrCode},
            {id: 'donatur', label: 'Donatur', icon: UsersGroupTwoRounded},
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as any)}
                activeOpacity={0.7}
                className={`flex-1 py-3.5 flex-row items-center justify-center gap-1.5 border-b-2 ${
                  isActive ? 'border-emerald-600' : 'border-transparent'
                }`}>
                <Icon
                  icon={tab.icon}
                  size={16}
                  color={isActive ? '#059669' : '#9CA3AF'}
                />
                <Text
                  className={`text-xs font-semibold ${
                    isActive ? 'text-emerald-700' : 'text-gray-400'
                  }`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ================= TAB 1: INFAQ ONLINE ================= */}
        {activeTab === 'online' && (
          <View className="p-4 space-y-3.5">
            {/* Nominal Box */}
            <View className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
              <Text className="text-sm font-bold text-gray-800 mb-3">
                Nominal Infaq
              </Text>
              <View className="relative flex-row items-center border border-gray-200 rounded-xl px-4 py-3 bg-white mb-3">
                <Text className="text-base font-bold text-gray-500 mr-2">Rp</Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#D1D5DB"
                  value={amount > 0 ? amount.toLocaleString('id-ID') : ''}
                  onChangeText={handleAmountChange}
                  className="flex-1 text-base font-bold text-gray-900 p-0"
                />
              </View>

              {/* 4 Presets */}
              <View className="flex-row gap-2">
                {NOMINAL_OPTIONS.map(val => {
                  const isSelected = amount === val;
                  return (
                    <TouchableOpacity
                      key={val}
                      onPress={() => handleSelectPreset(val)}
                      activeOpacity={0.7}
                      className={`flex-1 py-2.5 rounded-xl border items-center justify-center ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600'
                          : 'bg-gray-50 border-gray-200 active:bg-gray-100'
                      }`}>
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-white' : 'text-gray-600'
                        }`}>
                        {val === 10000
                          ? '10rb'
                          : val === 25000
                            ? '25rb'
                            : val === 50000
                              ? '50rb'
                              : '100rb'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View className="flex-row items-center gap-1.5 mt-3">
                <Icon icon={InfoCircle} size={13} color="#9CA3AF" />
                <Text className="text-[11px] text-gray-400">
                  Minimal infaq Rp1.000
                </Text>
              </View>
            </View>

            {/* Metode Pembayaran */}
            <View className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
              <Text className="text-sm font-bold text-gray-800 mb-3">
                Metode Pembayaran
              </Text>

              <TouchableOpacity
                onPress={handleOpenMethodModal}
                activeOpacity={0.7}
                className="w-full flex-row items-center justify-between border border-gray-200 rounded-xl p-3.5 bg-gray-50/50">
                <View className="flex-row items-center gap-3 flex-1 mr-2">
                  {selectedMethod?.image_url ? (
                    <Image
                      source={{uri: selectedMethod.image_url}}
                      className="w-10 h-7 rounded"
                      resizeMode="contain"
                    />
                  ) : (
                    <View className="w-10 h-7 rounded bg-gray-100 items-center justify-center">
                      <Icon icon={Card} size={18} color="#9CA3AF" />
                    </View>
                  )}
                  <Text
                    numberOfLines={1}
                    className="text-sm font-bold text-gray-800 flex-1">
                    {selectedMethod?.name || 'Pilih metode pembayaran'}
                  </Text>
                </View>

                <View className="bg-emerald-500 rounded-lg px-3 py-1.5">
                  <Text className="text-xs font-bold text-white">Ganti</Text>
                </View>
              </TouchableOpacity>

              {/* Saldo Dompet info jika memilih dompet kebaikan */}
              {isWallet && (
                <View className="mt-3 flex-row items-center justify-between bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
                  <Text className="text-xs text-emerald-800 font-medium">
                    Saldo Saku Kebaikan
                  </Text>
                  <Text className="text-sm font-bold text-emerald-700">
                    {formatRupiah(walletBalance ?? 0)}
                  </Text>
                </View>
              )}
            </View>

            {/* Data Donatur */}
            <View className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
              <Text className="text-sm font-bold text-gray-800 mb-3">
                Data Donatur
              </Text>

              {isAuthenticated ? (
                <View className="flex-row items-center gap-3 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center">
                    <Text className="text-base font-bold text-emerald-700">
                      {(authUser?.name || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-gray-800">
                      {authUser?.name || 'Donatur'}
                    </Text>
                    <Text className="text-xs text-gray-400 mt-0.5">
                      {authUser?.phone || '-'}
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="space-y-3">
                  <View>
                    <Text className="text-xs text-gray-500 font-medium mb-1.5">
                      Nama Lengkap
                    </Text>
                    <TextInput
                      editable={!isAnonymous}
                      placeholder={isAnonymous ? 'Hamba Allah' : 'Masukkan nama lengkap'}
                      placeholderTextColor="#9CA3AF"
                      value={isAnonymous ? 'Hamba Allah' : guestName}
                      onChangeText={setGuestName}
                      className={`border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 ${
                        isAnonymous ? 'bg-gray-100 opacity-60' : 'bg-white'
                      }`}
                    />
                    <TouchableOpacity
                      onPress={() => setIsAnonymous(prev => !prev)}
                      activeOpacity={0.7}
                      className="flex-row items-center gap-2 mt-2">
                      <View
                        className={`w-4 h-4 rounded border items-center justify-center ${
                          isAnonymous
                            ? 'bg-emerald-600 border-emerald-600'
                            : 'border-gray-300'
                        }`}>
                        {isAnonymous && <Text className="text-white text-[10px]">✓</Text>}
                      </View>
                      <Text className="text-xs text-gray-500">
                        Sembunyikan nama{' '}
                        <Text className="text-gray-400 italic">(Hamba Allah)</Text>
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View>
                    <Text className="text-xs text-gray-500 font-medium mb-1.5">
                      Nomor WhatsApp
                    </Text>
                    <TextInput
                      keyboardType="phone-pad"
                      placeholder="08xxxxxxxxxx"
                      placeholderTextColor="#9CA3AF"
                      value={guestPhone}
                      onChangeText={setGuestPhone}
                      className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 bg-white"
                    />
                  </View>
                </View>
              )}

              {/* Toggle Atas Nama Orang Lain */}
              <View className="pt-3 border-t border-gray-100 mt-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-2">
                    <Text className="text-xs font-semibold text-gray-800">
                      Infak untuk orang lain
                    </Text>
                    <Text className="text-[11px] text-gray-400">
                      Niatkan infak ini atas nama orang tua atau keluarga
                    </Text>
                  </View>
                  <Switch
                    value={isForOther}
                    onValueChange={setIsForOther}
                    trackColor={{false: '#E5E7EB', true: '#10B981'}}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {isForOther && (
                  <View className="mt-3">
                    <Text className="text-xs text-gray-500 font-medium mb-1.5">
                      Nama yang Diniatkan
                    </Text>
                    <TextInput
                      placeholder="Contoh: Ibu Fatimah binti Ahmad"
                      placeholderTextColor="#9CA3AF"
                      value={otherName}
                      onChangeText={setOtherName}
                      className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 bg-white"
                    />
                  </View>
                )}
              </View>

              {/* Doa & Dukungan */}
              <View className="pt-3 border-t border-gray-100 mt-4">
                <Text className="text-xs text-gray-500 font-medium mb-1.5">
                  Doa atau Pesan Kebaikan{' '}
                  <Text className="text-gray-400 font-normal">(opsional)</Text>
                </Text>
                <TextInput
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholder="Tulis doa atau harapan Anda..."
                  placeholderTextColor="#9CA3AF"
                  value={doa}
                  onChangeText={setDoa}
                  className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-white min-h-[72px]"
                />
              </View>
            </View>
          </View>
        )}

        {/* ================= TAB 2: QR CODE ================= */}
        {activeTab === 'qr' && (
          <View className="p-4 items-center">
            <View className="bg-white rounded-2xl border border-gray-100 p-6 w-full items-center shadow-xs">
              <Text className="text-sm font-bold text-gray-800 mb-1">
                Scan QRIS untuk Berinfak
              </Text>
              <Text className="text-xs text-gray-400 text-center mb-5">
                Buka aplikasi m-banking atau e-wallet apa saja yang mendukung QRIS
              </Text>

              <View className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-4 items-center justify-center">
                <Image
                  source={{
                    uri:
                      qrData?.image_url ||
                      'https://cdn.beramalbersama.com/settings/1790646965245_aa25a2_qris-beramal.webp',
                  }}
                  className="w-64 h-64 rounded-xl"
                  resizeMode="contain"
                />
              </View>

              <Text className="text-sm font-bold text-gray-800">
                Yayasan Sahabat Beramal Bersama
              </Text>
              <Text className="text-xs text-gray-500 mt-1 text-center max-w-[260px]">
                NMID: ID1020038830113 • Beramal Bersama Infak
              </Text>
            </View>
          </View>
        )}

        {/* ================= TAB 3: DONATUR ================= */}
        {activeTab === 'donatur' && (
          <View className="p-4 space-y-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm font-bold text-gray-800">
                Daftar Donatur Infak
              </Text>
              <View className="bg-emerald-100 rounded-full px-2.5 py-0.5">
                <Text className="text-xs font-bold text-emerald-800">
                  {donors.length} Donatur
                </Text>
              </View>
            </View>

            {donors.length === 0 ? (
              <View className="bg-white rounded-2xl border border-gray-100 p-8 items-center justify-center">
                <Icon icon={HandHeart} size={36} color="#D1D5DB" />
                <Text className="text-xs text-gray-400 mt-2">
                  Belum ada donatur infak tercatat
                </Text>
              </View>
            ) : (
              donors.map(donor => (
                <View
                  key={donor.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs">
                  <View className="flex-row items-start gap-3">
                    <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center shrink-0">
                      <Text className="text-sm font-bold text-emerald-800">
                        {(donor.name || 'H').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1 min-w-0">
                      <View className="flex-row items-center justify-between">
                        <Text
                          numberOfLines={1}
                          className="text-sm font-bold text-gray-800 flex-1 mr-2">
                          {donor.name || 'Hamba Allah'}
                        </Text>
                        <Text className="text-xs font-bold text-emerald-600">
                          {formatRupiah(donor.nominal_donasi || 0)}
                        </Text>
                      </View>
                      <Text className="text-[11px] text-gray-400 mt-0.5">
                        {donor.date ? new Date(donor.date).toLocaleDateString('id-ID') : '-'}
                        {donor.bank_name ? ` • via ${donor.bank_name}` : ''}
                      </Text>

                      {donor.doa && (
                        <View className="bg-slate-50 rounded-xl p-3 mt-2.5 border border-slate-100">
                          <Text className="text-xs text-gray-700 italic">
                            "{donor.doa}"
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Bar (Hanya tampil di tab online) */}
      {activeTab === 'online' && (
        <View
          style={{paddingBottom: Math.max(insets.bottom, 12)}}
          className="bg-white border-t border-gray-100 px-5 pt-3 flex-row items-center justify-between shadow-lg">
          <View className="flex-1 mr-3">
            <Text className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Total Infak
            </Text>
            <Text className="text-base font-extrabold text-gray-900 mt-0.5">
              {formatRupiah(amount)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || amount < 1000}
            activeOpacity={0.8}
            className={`py-3.5 px-7 rounded-xl flex-row items-center justify-center shadow-xs ${
              isSubmitting || amount < 1000
                ? 'bg-gray-300 opacity-70'
                : 'bg-emerald-600 active:bg-emerald-700'
            }`}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-sm font-bold text-white">Lanjutkan</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Method Bottom Sheet */}
      <MetodePembayaranBottomSheet
        ref={methodSheetRef}
        paymentMethods={paymentMethods}
        isLoadingMethods={isLoadingMethods}
        selectedMethod={selectedMethod}
        isAuthenticated={isAuthenticated}
        walletBalance={walletBalance}
        isLoadingWalletBalance={isLoadingWallet}
        amount={amount}
        onSelectMethod={handleSelectPaymentMethod}
        onConfirm={() => methodSheetRef.current?.dismiss()}
      />
    </KeyboardAvoidingView>
  );
}
